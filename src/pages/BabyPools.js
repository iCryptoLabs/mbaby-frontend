import React, { useState, useEffect, useContext } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from "@mui/material/TextField";
import MenuItem from '@mui/material/MenuItem';
import Badge from '@mui/material/Badge';
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';

import useTheme from '@mui/styles/useTheme';
import useActiveWeb3React from "../hooks/useActiveWeb3React";

import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';

import { CONTRACTS } from "../config";

import { Web3Context, WalletContext } from '../hooks/context';

const { POOL, TOKEN } = CONTRACTS;

const Stake = () => {
    const theme = useTheme();
    const web3 = useContext(Web3Context);

    const [pools, setPools] = useState({});
    const [inactive, setInactive] = useState(false);
    const [sortBy, setSortBy] = useState("all");
    const [isApproved, setIsApproved] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isOpenBalance, setIsOpenBalance] = useState(false);

    const { isOpenWallet, setIsOpenWallet } = useContext(WalletContext);

    const { account, active } = useActiveWeb3React()

    const handleChangeSortBy = (e) => {
        setSortBy(e.target.value)
    }

    const inputBalance = () => {
        setIsOpenBalance(true);
    }

    const closeBalance = () => {
        setIsOpenBalance(false);
    }

    const update = async () => {
        if (!web3.eth) return;

        const poolIns = new web3.eth.Contract(POOL.ABI, POOL.ADDRESS);
        const tokenIns = new web3.eth.Contract(TOKEN.ABI, TOKEN.ADDRESS);

        const pool = await poolIns.methods.pools(0).call();

        if (account) {
            const userInfo = await poolIns.methods.userInfo(account, 0).call();
            pool.userInfo = userInfo;

            tokenIns.methods.allowance(account, POOL.ADDRESS).call({ from: account }).then(result => {
                const allowance = new web3.utils.BN(result);
                const amount = new web3.utils.BN((1000000000000 * 10 * 18).toString());
                if (allowance.lt(amount)) {
                    setIsApproved(false);
                } else {
                    setIsApproved(true);
                }
            });
        };

        setPools(prevStates => ({
            prevStates,
            ["pools"]: pool
        }));
    };

    // const deposit = () => {
    //     setIsProcessing(true);
    //     if (amount < 0 || amount > 2) {
    //         alert("Incorrect Amount...", "error");
    //         setIsProcessing(false);
    //         return;
    //     } else {
    //         const amountAsWei = new web3.utils.BN((amount * 10 ** 18).toString());
    //         const pSale = new web3.eth.Contract(PRIVATE_SALE_ABI, PRIVATE_SALE_CONTRACT);
    //         pSale.methods.deposit().send({ value: amountAsWei, from: account }).then((result) => {
    //             dialog(result, true);
    //             setIsProcessing(false);
    //             update();
    //         }).catch(e => {
    //             e.message ? alert(e.message, "error") : alert(`${(e.toString()).slice(0, 50)}...`, "error");
    //             setIsProcessing(false);
    //         });
    //     }
    // }

    const approve = (maxAmount) => {
        setIsProcessing(true);
        const amount = new web3.utils.BN(maxAmount);
        const tokenIns = new web3.eth.Contract(TOKEN.ABI, TOKEN.ADDRESS);
        tokenIns.methods.approve(POOL.ADDRESS, amount).send({ from: account }).then(() => {
            setIsProcessing(false);
            setIsApproved(true);
        }).catch(e => {
            e.message ? alert(e.message, "error") : alert(`${(e.toString()).slice(0, 50)}...`, "error");
            setIsProcessing(false);
        });
    };

    useEffect(() => {
        update();
    }, [web3, account, active]);

    return (
        <Box sx={{
            padding: theme => theme.spacing(2, 6),
            height: "100%",
            overflow: "auto",
            [theme.breakpoints.down("sm")]: {
                padding: theme.spacing(1, 1)
            }
        }}>
            <Container>
                <Box sx={{
                    mb: 4,
                    position: "relative",
                    bgcolor: "rgba(0, 0, 0, .25)",
                    borderRadius: 1,
                    pt: 2,
                    pl: 2,
                    pr: 2,
                    lineHeight: '0',
                    [theme.breakpoints.down("sm")]: {
                        pt: 5
                    }
                }}>
                    <Box
                        component={"img"}
                        src={require("../assets/img/staking/banner.png")}
                        alt="staking banner"
                        sx={{
                            height: 300,
                            [theme.breakpoints.down("sm")]: {
                                width: "100%",
                                height: "auto"
                            }
                        }}
                    />
                    <Typography variant="h3" sx={{
                        fontWeight: "bold",
                        position: "absolute",
                        right: theme => theme.spacing(2),
                        top: "50%",
                        transform: "translateY(-50%)",
                        [theme.breakpoints.down("sm")]: {
                            top: theme => theme.spacing(2),
                            left: 0,
                            textAlign: "center",
                            width: "100%",
                            transform: "none",
                            fontSize: 30
                        }
                    }}>
                        Fixed APY Staking
                    </Typography>
                </Box>
                <Stack direction={{ xs: "column", sm: "row" }} sx={{ mb: 4 }} spacing={2} justifyContent="space-between">
                    <Stack direction={"row"} spacing={2} justifyContent="space-between">
                        <ButtonGroup color="secondary" aria-label="outlined button group">
                            <Button
                                variant={inactive ? "outlined" : "contained"}
                                onClick={() => setInactive(false)}
                            >
                                Active
                            </Button>
                            <Button
                                variant={inactive ? "contained" : "outlined"}
                                onClick={() => setInactive(true)}
                            >
                                Inactive
                            </Button>
                        </ButtonGroup>
                        <FormControlLabel
                            value="end"
                            control={<Switch defaultChecked color="secondary" />}
                            label="Staked Only"
                            labelPlacement="end"
                        />
                    </Stack>
                    <TextField
                        id="sortby"
                        select
                        name="sortby"
                        color="secondary"
                        label="Sort By"
                        value={sortBy}
                        size="small"
                        onChange={handleChangeSortBy}
                        sx={{
                            minWidth: theme => theme.spacing(30)
                        }}
                    >
                        <MenuItem value="all">
                            All
                        </MenuItem>
                        <MenuItem value="mcap">
                            APY
                        </MenuItem>
                        <MenuItem value="users">
                            Liquidity
                        </MenuItem>
                    </TextField>
                </Stack>
                <Grid container spacing={2}>
                    {Object.values(pools).map((item, idx) => {
                        const td = Number(Number(item.totalDeposited / 10 ** 18).toFixed(2));
                        const mx = Number(Number(item.maxPoolAmount / 10 ** 18).toFixed(2));
                        const apy = Number(item.dayPercent * 365 / 10 ** 9).toFixed(2);
                        return (
                            <React.Fragment key={item.id} >
                                <Grid item sm={12} md={6} lg={5}>
                                    <Card>
                                        <CardContent sx={{ position: "relative", pt: 8 }}>
                                            <Typography variant="h6" sx={{
                                                bgcolor: "secondary.main",
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                padding: theme => theme.spacing(0.5, 1.5),
                                                borderBottomRightRadius: theme => theme.shape.borderRadius
                                            }}>
                                                BABY POOL #{item.id + 1}
                                            </Typography>
                                            <Stack direction={"row"} alignItems="center" spacing={1} sx={{
                                                bgcolor: "success.main",
                                                position: "absolute",
                                                top: 0,
                                                right: 0,
                                                padding: theme => theme.spacing(0.5, 1.5),
                                                borderBottomLeftRadius: theme => theme.shape.borderRadius
                                            }}>
                                                <TimelapseIcon />
                                                <Stack>
                                                    <Typography variant="caption" sx={{ lineHeight: "16px" }}>Locked</Typography>
                                                    <Typography variant="caption" sx={{ lineHeight: "16px" }}>{item.lockPeriod} Days</Typography>
                                                </Stack>
                                            </Stack>
                                            <Stack direction="row" spacing={4}>
                                                <Badge
                                                    overlap="circular"
                                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                    badgeContent={
                                                        <Avatar
                                                            aria-label="recipe"
                                                            src={require("../assets/img/mbaby.png")}
                                                            alt="MBABY_BTC"
                                                            sx={{
                                                                bgcolor: "rgba(255, 255, 255, .075)",
                                                                p: 0.5,
                                                                borderRadius: 10,
                                                                width: theme.spacing(4),
                                                                height: theme.spacing(4),
                                                                ["& img"]: {
                                                                    height: "100%",
                                                                    width: "100%",
                                                                }
                                                            }}
                                                        />
                                                    }
                                                >
                                                    <Avatar
                                                        aria-label="recipe"
                                                        src={require("../assets/img/mbaby.png")}
                                                        alt="MBABY_BTC"
                                                        sx={{
                                                            bgcolor: "rgba(255, 255, 255, .075)",
                                                            p: 0.5,
                                                            borderRadius: 10,
                                                            width: theme.spacing(7),
                                                            height: theme.spacing(7),
                                                            ["& img"]: {
                                                                height: "100%",
                                                                width: "100%",
                                                            }
                                                        }}
                                                    />
                                                </Badge>
                                                <Stack>
                                                    <Typography>
                                                        EARN MBABY
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        STAKE MBABY
                                                    </Typography>
                                                    <Typography>
                                                        APY {apy}%
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                            <Divider sx={{ mt: 2 }} />
                                            <Stack>
                                                <Stack direction="row" justifyContent={"space-between"} alignItems="center" sx={{ pt: 2, pb: 1 }}>
                                                    <Stack direction={"row"} alignItems="center">
                                                        <Typography variant="body2">
                                                            Staked
                                                        </Typography>
                                                        <Tooltip title="Stake a minimum of 200 BSW in Holder Pool to participate and earn rewards" arrow placement="top">
                                                            <IconButton size="small" sx={{
                                                                borderRadius: 8,
                                                                padding: 0.1,
                                                                ml: 1
                                                            }}>
                                                                <HelpOutlineRoundedIcon sx={{ fontSize: 20 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                    <Typography variant="body2">
                                                        {Number(item.deposited).toFixed(4)}
                                                    </Typography>
                                                </Stack>
                                                <Stack direction="row" justifyContent={"space-between"} alignItems="center" sx={{ pb: 2 }}>
                                                    <Stack direction={"row"} alignItems="center">
                                                        <Typography variant="body2">
                                                            Total Stake
                                                        </Typography>
                                                        <Tooltip title="Stake a minimum of 200 BSW in Holder Pool to participate and earn rewards" arrow placement="top">
                                                            <IconButton size="small" sx={{
                                                                borderRadius: 8,
                                                                padding: 0.1,
                                                                ml: 1
                                                            }}>
                                                                <HelpOutlineRoundedIcon sx={{ fontSize: 20 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                    <Typography variant="body2">
                                                        {td} / {mx}
                                                    </Typography>
                                                </Stack>
                                                <LinearProgress variant="determinate" value={(td / mx) * 100} sx={{
                                                    borderRadius: 1
                                                }} />
                                            </Stack>
                                            {(() => {
                                                if (account) {
                                                    if (!isApproved) {
                                                        return (
                                                            <LoadingButton
                                                                variant="contained"
                                                                loading={isProcessing}
                                                                onClick={() => approve(item.maxPoolAmount)}
                                                                color="secondary"
                                                                fullWidth
                                                                startIcon={
                                                                    <HowToRegRoundedIcon />
                                                                }
                                                                sx={{
                                                                    mt: 2
                                                                }}
                                                            >
                                                                Approve
                                                            </LoadingButton>
                                                        )
                                                    }
                                                    return (
                                                        <LoadingButton
                                                            variant="contained"
                                                            loading={isProcessing}
                                                            onClick={inputBalance}
                                                            color="secondary"
                                                            fullWidth
                                                            startIcon={
                                                                <AddShoppingCartRoundedIcon />
                                                            }
                                                            sx={{
                                                                mt: 2
                                                            }}
                                                        >
                                                            Stake
                                                        </LoadingButton>
                                                    )
                                                } else {
                                                    return (
                                                        <Button
                                                            onClick={() => setIsOpenWallet(!isOpenWallet)}
                                                            variant="contained"
                                                            fullWidth
                                                            color="secondary"
                                                            startIcon={
                                                                <Avatar
                                                                    aria-label="recipe"
                                                                    src={require("../assets/img/wallets/wallet.svg").default}
                                                                    alt="MBABY_BTC"
                                                                    sx={{
                                                                        p: 0.5,
                                                                        borderRadius: 1,
                                                                        width: theme.spacing(4),
                                                                        height: theme.spacing(4),
                                                                        ["& img"]: {
                                                                            height: "100%",
                                                                            width: "100%",
                                                                        }
                                                                    }}
                                                                />
                                                            }
                                                            sx={{
                                                                mt: 2
                                                            }}
                                                        >
                                                            Connect Wallet
                                                        </Button>
                                                    )
                                                }
                                            })()}
                                            <Stack direction="row" justifyContent={"space-between"} alignItems="center" sx={{ pt: 2, pb: 2 }}>
                                                <Stack spacing={.5}>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Earned MBABY
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary" sx={{
                                                        bgcolor: "background.paper",
                                                        borderRadius: 1,
                                                        padding: .5,
                                                        textAlign: "center"
                                                    }}>
                                                        Not Active
                                                    </Typography>
                                                </Stack>
                                                <Button disabled variant="contained" color="primary">
                                                    Harvest
                                                </Button>
                                            </Stack>
                                            <Tooltip title="Stake a minimum of 200 BSW in Holder Pool to participate and earn rewards" arrow placement="top">
                                                <Typography variant="body2" color="textSecondary" sx={{
                                                    width: "100%",
                                                    textAlign: "center",
                                                    borderWidth: 1,
                                                    borderRadius: 1,
                                                    borderColor: "rgba(255, 255, 255, .25)",
                                                    borderStyle: "dotted",
                                                    p: 1
                                                }}>
                                                    1.99% unstaking fee if withdrawn within {item.lockPeriod} days
                                                </Typography>
                                            </Tooltip>
                                            <Stack sx={{
                                                pt: 2
                                            }}>
                                                <Stack direction="row" alignItems={"center"}>
                                                    <Typography variant="overline" color="textSecondary">
                                                        Max.Stake per user
                                                    </Typography>
                                                    <Box sx={{
                                                        flexGrow: 1,
                                                        borderWidth: 0,
                                                        borderBottomWidth: 1,
                                                        borderRadius: 1,
                                                        borderColor: "rgba(255, 255, 255, .25)",
                                                        borderStyle: "dotted",
                                                        marginTop: -3 / 8,
                                                        ml: 1,
                                                        mr: 1
                                                    }} />
                                                    <Typography variant="overline">
                                                        {item.maxDeposit / 10 ** 18}
                                                    </Typography>
                                                </Stack>
                                                <Stack direction="row" alignItems={"center"}>
                                                    <Typography variant="overline" color="textSecondary">
                                                        Min.Stake per user
                                                    </Typography>
                                                    <Box sx={{
                                                        flexGrow: 1,
                                                        borderWidth: 0,
                                                        borderBottomWidth: 1,
                                                        borderRadius: 1,
                                                        borderColor: "rgba(255, 255, 255, .25)",
                                                        borderStyle: "dotted",
                                                        marginTop: -3 / 8,
                                                        ml: 1,
                                                        mr: 1
                                                    }} />
                                                    <Typography variant="overline">
                                                        {item.minDeposit / 10 ** 18}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                            <Stack direction="row" sx={{ pt: 2 }} spacing={2}>
                                                <Button size="small" variant="outlined" fullWidth endIcon={
                                                    <LaunchRoundedIcon sx={{ fontSize: 16 }} />
                                                }>
                                                    View Contract
                                                </Button>
                                                <Button size="small" variant="outlined" fullWidth startIcon={
                                                    <Box
                                                        component="img"
                                                        src={require("../assets/img/wallets/meta-mask.svg").default}
                                                        alt="MetaMask"
                                                        sx={{
                                                            width: theme.spacing(2)
                                                        }}
                                                    />
                                                }>
                                                    Add to MetaMask
                                                </Button>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>{
                                    console.log(idx % 2)
                                }
                                {((idx + 1) % 2) === 1 && (
                                    <Grid item display={{ md: "none", lg: "block" }} lg={2} />
                                )}
                            </React.Fragment>
                        )
                    })}
                </Grid>
            </Container>
            <Dialog open={isOpenBalance} onClose={closeBalance}>
                <DialogTitle>
                    Input your balnce
                </DialogTitle>
            </Dialog>
        </Box >
    )
}
export default Stake;