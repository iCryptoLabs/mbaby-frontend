import React, { useContext, useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import TextField from "@mui/material/TextField";
import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';

import { CopyToClipboard } from "react-copy-to-clipboard";

import { Web3Context, WalletContext } from "../hooks/context";
import useActiveWeb3React from "../hooks/useActiveWeb3React";

import { CONTRACTS, BASE_BSC_SCAN_URL } from "../config";

import { useConfirm } from "material-ui-confirm";

import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';

const { NFT } = CONTRACTS;

const NFB = () => {
    const confirm = useConfirm();

    const [amount, setAmount] = useState(0);

    const [price, setPrice] = useState(0);
    const [sold, setSold] = useState(0);
    const [max, setMax] = useState(0);
    const [free, setFree] = useState(0);
    const [txList, setTxList] = useState([]);

    const [isProcessing, setIsProcessing] = useState(false);

    const web3 = useContext(Web3Context);
    const { isOpenWallet, setIsOpenWallet } = useContext(WalletContext);

    const handleAmount = e => {
        const value = Number(e.target.value);
        setAmount(parseInt(value, 10));
    }

    const { account, active } = useActiveWeb3React();

    const updateData = async () => {
        try {
            if (web3.eth) {
                const nfb = new web3.eth.Contract(NFT.ABI, NFT.ADDRESS);
                nfb.methods.PRICE().call().then(price => {
                    setPrice(price);
                });
                nfb.methods.totalSupply().call().then(sold => {
                    setSold(sold);
                });
                setMax(10000);
                if (account) {
                    nfb.methods.whiteListFreeLimit(account).call().then(free => {
                        setFree(free);
                    })
                }
                const cbn = await web3.eth.getBlockNumber();
                let events = [];
                let count = 1;
                while (count < 50) {
                    const temp = await nfb.getPastEvents('Transfer', { fromBlock: (cbn - (5000 * count)), toBlock: (cbn - (5000 * (count - 1))) });
                    events = events.concat(temp);
                    count++;
                    if (events.length >= 5)
                        break;
                }
                const txlist = events.sort((a, b) => b.returnValues.tokenId - a.returnValues.tokenId).slice(0, 5);
                const txArray = [];
                for (let i in txlist) {
                    const {
                        returnValues: {
                            tokenId,
                            to
                        },
                        transactionHash
                    } = txlist[i];
                    txArray.push({
                        wallet: to,
                        tokenId,
                        transactionHash
                    });
                }
                setTxList(txArray);
            }
        } catch (e) {
            console.log(e.toString());
        }
    }

    const mint = async () => {
        if (!amount) {
            alert("Enter exact amount.", "info");
        } else {
            setIsProcessing(true);
            try {
                const nfb = new web3.eth.Contract(NFT.ABI, NFT.ADDRESS);
                const priceAsBN = new web3.utils.BN(price);
                const isFree = (Number(free) >= Number(amount));
                const amountAsBN = new web3.utils.BN(isFree ? 0 : String(Math.abs(free - amount)));
                const tPrice = priceAsBN.mul(amountAsBN);
                const result = await nfb.methods.mintNFTs(amount).send({ from: account, value: isFree ? 0 : tPrice });
                dialog(result, true);
                setIsProcessing(false);
                updateData();
            } catch (e) {
                alert(typeof (e) === "object" ? e.message : e.toString(), "error");
                setIsProcessing(false);
            }
        }
    }

    const dialog = (result) => {
        const { transactionHash } = result;
        confirm({
            title: "",
            content: (() => {
                return (
                    <Stack justifyContent="center" alignItems="center" spacing={2} sx={{ pt: 4 }}>
                        <TaskAltIcon sx={{
                            width: theme => theme.spacing(8),
                            height: theme => theme.spacing(8),
                            mb: 1
                        }} color="success" />
                        <Typography sx={{ fontSize: theme => theme.spacing(2.25) }}>
                            Transaction Submitted Successfully
                        </Typography>
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                            <Link target="_blank" color="inherit" href={`${BASE_BSC_SCAN_URL}/tx/${transactionHash}`}>
                                <Typography component="span" sx={{ lineHeight: 0 }}>
                                    {transactionHash.substring(0, 8)}...{transactionHash.substring(transactionHash.length - 8, transactionHash.length)}
                                </Typography>
                            </Link>
                            <CopyToClipboard
                                text={transactionHash}
                            >
                                <IconButton size="small">
                                    <ContentCopyIcon fontSize="small" />
                                </IconButton>
                            </CopyToClipboard>
                        </Stack>
                    </Stack>
                )
            })(),
            confirmationText: (() => (
                <IconButton component="div" sx={{
                    background: "rgba(255, 255, 255, .05)"
                }}>
                    <CloseIcon />
                </IconButton>
            ))(),
            confirmationButtonProps: {
                sx: {
                    position: "absolute",
                    top: 16,
                    right: 16,
                }
            },
            cancellationText: "",
            dialogProps: {
                maxWidth: "xs"
            }
        }).then(() => {
        }).catch(() => { });
    }

    useEffect(() => {
        updateData();
    }, [web3, account, active]);

    return (
        <Box sx={{
            overflow: "auto",
            height: "100%",
        }}>
            <Container maxWidth="md" >
                <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    gap: theme => theme.spacing(4)
                }}>
                    <Stack direction={"row"} justifyContent="center" alignItems={"center"}>
                        <Box
                            component="img"
                            src={require("../assets/img/nfb/nfb.png")}
                            alt="NFB Logo"
                            sx={{
                                borderRadius: 1,
                            }}
                        />
                    </Stack>
                    <Stack justifyContent="center" alignItems={"center"}>
                        <Typography variant="h4">
                            Exclusive <Typography color="primary" variant="h4" sx={{ fontWeight: "600" }} component={"span"}>NFTs</Typography> by
                        </Typography>
                        <Typography variant="h6" color="secondary">
                            MetaBaby
                        </Typography>
                    </Stack>
                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={5}>
                            <Box
                                component="img"
                                src={require("../assets/img/bg/nfb.gif")}
                                alt="NFB Gif"
                                sx={{
                                    width: "100%",
                                    borderRadius: 1,
                                    boxShadow: theme => theme.shadows[4]
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={7}>
                            <Typography variant="subtitle1" color="primary">
                                About
                            </Typography>
                            <Typography variant="h5">
                                The NFBs
                            </Typography>
                            <Typography variant="body2">
                                These Non-Fungible Babies (NFBs) are very precious in the Babyverse. Every character in the game starts as a baby and upgrade their age and characteristics using the precious NFBs.
                            </Typography>
                            <Typography variant="body2">
                                Outside Babyverse NFBs can be staked to earn $MBABY rewards at a fixed APY%
                            </Typography>
                            <Link href="https://docs.themetababy.io/products/nfts" target="_blank" underline="none">
                                <Button variant="contained" color="secondary" sx={{ mt: 2 }}>
                                    Learn More
                                </Button>
                            </Link>
                        </Grid>
                    </Grid>
                    <Stack spacing={2} sx={{
                        mt: 2,
                        mb: 2,
                        background: "rgba(255, 255, 255, .05)",
                        borderRadius: theme => theme.shape.borderRadius / 8,
                        padding: 2,
                        borderWidth: 1,
                        borderColor: theme => theme.palette.background.paper,
                        borderStyle: "solid",
                        width: "100%"
                    }}>
                        <Divider>
                            10K Unique NFB Collection
                        </Divider>
                        <Typography variant="h5" sx={{ textAlign: "center" }}>
                            Buy randomly generated NFBs for 0.1 BNB
                        </Typography>
                        <Button
                            variant="outlined"
                            color="secondary"
                            sx={{
                                padding: 0
                            }}
                        >
                            <LinearProgress
                                variant="determinate"
                                value={sold / max * 100}
                                sx={{
                                    height: 36,
                                    width: "100%",
                                    background: "transparent",
                                    borderRadius: 1,
                                    ["& > span"]: {
                                        background: "#F45FA3"
                                    }
                                }}
                            />
                            <Typography sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                textTransform: "none",
                                color: "#fff",
                                fontWeight: 300
                            }}>
                                {sold}/10000 Sold
                            </Typography>
                        </Button>
                        <Grid container>
                            <Grid item xs={12} sm={5}>
                                <Box
                                    component="img"
                                    src={require("../assets/img/nfb/box.png")}
                                    alt="NFB box"
                                    sx={{
                                        width: "100%",
                                        borderRadius: 1,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={7} sx={{
                                justifyContent: 'center',
                                display: "flex",
                                alignItems: "center",
                                flexDirection: "column"
                            }}>
                                <Typography sx={{ mb: 2 }}>
                                    Enter Quantity
                                </Typography>
                                <Stack direction="row" justifyContent={"space-between"} alignItems="center" spacing={1}>
                                    <IconButton onClick={() => amount > 0 ? setAmount(amount - 1) : ""}>
                                        <RemoveRoundedIcon />
                                    </IconButton>
                                    <TextField
                                        size="small"
                                        value={amount}
                                        onChange={handleAmount}
                                        type="number"
                                        sx={{
                                            ["& input"]: {
                                                textAlign: "center",
                                                ["&::-webkit-outer-spin-button, &::-webkit-inner-spin-button"]: {
                                                    WebkitAppearance: "none",
                                                    margin: 0
                                                }
                                            }
                                        }}
                                    />
                                    <IconButton onClick={() => setAmount(amount + 1)}>
                                        <AddRoundedIcon />
                                    </IconButton>
                                </Stack>
                                <Typography variant="caption" color="textSecondary" sx={{
                                    mt: 1
                                }}>
                                    Total Price: {Number(Number(price / 10 ** 18 * (free >= amount ? 0 : Math.abs(free - amount))).toFixed(2))} BNB
                                    {account && (
                                        <>, Free NFBs: {free}</>
                                    )}
                                </Typography>
                                <Stack direction="row" justifyContent={"center"} alignItems="center" spacing={1} sx={{ mt: 2 }}>
                                    <IconButton size="small" sx={{ width: 36, height: 36, background: "rgba(255, 255, 255, .05)" }} onClick={() => setAmount(1)}>
                                        1
                                    </IconButton>
                                    <IconButton size="small" sx={{ width: 36, height: 36, background: "rgba(255, 255, 255, .05)" }} onClick={() => setAmount(5)}>
                                        5
                                    </IconButton>
                                    <IconButton size="small" sx={{ width: 36, height: 36, background: "rgba(255, 255, 255, .05)" }} onClick={() => setAmount(10)}>
                                        10
                                    </IconButton>
                                    <IconButton size="small" sx={{ width: 36, height: 36, background: "rgba(255, 255, 255, .05)" }} onClick={() => setAmount(20)}>
                                        20
                                    </IconButton>
                                    <IconButton size="small" sx={{ width: 36, height: 36, background: "rgba(255, 255, 255, .05)" }} onClick={() => setAmount(50)}>
                                        50
                                    </IconButton>
                                </Stack>
                                {(() => {
                                    if (active && account && web3.eth) {
                                        return (
                                            <LoadingButton
                                                variant="contained"
                                                color="secondary"
                                                sx={{ mt: 2 }}
                                                loadingIndicator="Minting..."
                                                onClick={mint}
                                                loading={isProcessing}
                                            >
                                                Mint Now
                                            </LoadingButton>
                                        )
                                    } else {
                                        return (
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                sx={{ mt: 2 }}
                                                onClick={() => setIsOpenWallet(!isOpenWallet)}
                                            >
                                                Connect Wallet
                                            </Button>
                                        )
                                    }
                                })()}
                            </Grid>
                        </Grid>
                    </Stack>
                </Box>
                <Box sx={{
                    padding: theme => theme.spacing(3, 4),
                    background: "rgba(0, 0, 0, .25)",
                    borderRadius: 1,
                    ["& td, & th"]: {
                        borderColor: "rgba(255, 255, 255, .085)"
                    }
                }}>
                    <Typography variant="h5" sx={{ pb: 2 }}>
                        Latest Transactions
                    </Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    TokenId
                                </TableCell>
                                <TableCell sx={{ textAlign: "center" }}>
                                    Txn Hash
                                </TableCell>
                                <TableCell sx={{ textAlign: "right" }}>
                                    Wallet
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {txList.length ? (
                                <>
                                    {txList.map(({
                                        tokenId,
                                        transactionHash,
                                        wallet
                                    }) => {
                                        return (
                                            <TableRow key={tokenId}>
                                                <TableCell>
                                                    #{tokenId}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Link target="_blank" color="inherit" href={`${BASE_BSC_SCAN_URL}/tx/${transactionHash}`}>
                                                        {transactionHash.substring(
                                                            0,
                                                            12
                                                        )} ... {transactionHash.substring(
                                                            transactionHash.length - 12
                                                        )}
                                                    </Link>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "right" }}>
                                                    <Link target="_blank" color="inherit" href={`${BASE_BSC_SCAN_URL}/address/${wallet}`}>
                                                        {wallet.substring(
                                                            0,
                                                            6
                                                        )} ... {wallet.substring(
                                                            wallet.length - 6
                                                        )}
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </>
                            ) : (
                                <TableRow>
                                    <TableCell sx={{ border: "none", textAlign: "center", pt: 4, pb: 4 }} colSpan={3}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Box>
            </Container>
        </Box>
    )
}

export default NFB;