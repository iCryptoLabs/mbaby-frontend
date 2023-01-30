import React, { useState, useContext, useEffect } from "react";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Skeleton from '@mui/material/Skeleton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import Checkbox from '@mui/material/Checkbox';

import useTheme from '@mui/styles/useTheme';
import useActiveWeb3React from "../hooks/useActiveWeb3React";

import { Web3Context } from '../hooks/context';

import { CONTRACTS, RARITY } from "../config";

const { NSTAKE, TOKEN, NFT } = CONTRACTS;

const StakeNFBs = () => {
    const theme = useTheme();

    const web3 = useContext(Web3Context);

    const { account } = useActiveWeb3React();

    const [activeTab, setActiveTab] = useState(0);
    const [status, setStatus] = useState({});
    const [apy, setAPY] = useState();
    const [isOpenDialog, setIsOpenDialog] = useState(false);
    const [isOpenUnstakeDialog, setIsOpenUnstakeDialog] = useState(false);
    const [nfbs, setNFBs] = useState({});
    const [tokens, setTokens] = useState([]);
    const [selectedNFB, setSelectedNFB] = useState({});
    const [isApproved, setIsApproved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fn = (val = 0, decimal = 4) => {
        return Number(Number(val).toFixed(decimal)).toLocaleString();
    }

    const toBN = (val) => {
        if (val && web3) {
            return new web3.utils.BN(String(val));
        }
    }

    const toWei = (val, decimal) => {
        if (decimal) {
            return val / 10 ** decimal;
        }
        if (val && web3) {
            return web3.utils.toWei(val.toString());
        }
        return 0;
    }

    const fromWei = (val, decimal) => {
        if (decimal) {
            return val / 10 ** decimal;
        }
        if (val && web3) {
            return web3.utils.fromWei(val.toString());
        }
        return 0;
    }

    const approve = () => {
        setIsLoading(true);
        const nftIns = new web3.eth.Contract(NFT.ABI, NFT.ADDRESS);
        nftIns.methods.setApprovalForAll(NSTAKE.ADDRESS, true).send({ from: account }).then(result => {
            setIsApproved(result);
            setIsLoading(false);
        }).catch(() => {
            alert("Transaction has been failed", "error");
            setIsLoading(false);
        });
    }

    const claim = () => {
        setIsLoading(true);
        const stakeIns = new web3.eth.Contract(NSTAKE.ABI, NSTAKE.ADDRESS);
        stakeIns.methods.withdrawReward().send({ from: account }).then(() => {
            update();
            setIsLoading(false);
        }).catch(() => {
            alert("Transaction has been failed", "error");
            setIsLoading(false);
        });
    }

    const stake = () => {
        setIsLoading(true);
        const array = [];
        for (let key in selectedNFB) {
            if (!selectedNFB[key]) continue;
            const id = key.replace("#", "");
            array.push(Number(id));
        }
        const stakeIns = new web3.eth.Contract(NSTAKE.ABI, NSTAKE.ADDRESS);
        stakeIns.methods.stake(array.sort()).send({ from: account }).then(() => {
            updateStakedNFBs();
            updateNFBs();
            update();
            setIsLoading(false);
            closeStakeDialog();
        }).catch(() => {
            alert("Transaction has been failed", "error");
            setIsLoading(false);
        });
    }

    const unstake = () => {
        setIsLoading(true);
        const array = [];
        for (let key in selectedNFB) {
            if (!selectedNFB[key]) continue;
            const id = key.replace("#", "");
            array.push(Number(id));
        }
        const stakeIns = new web3.eth.Contract(NSTAKE.ABI, NSTAKE.ADDRESS);
        stakeIns.methods.unstake(array.sort()).send({ from: account }).then(() => {
            updateStakedNFBs();
            updateNFBs();
            update();
            setIsLoading(false);
            closeUnstakeDialog();
        }).catch(() => {
            alert("Transaction has been failed", "error");
            setIsLoading(false);
        });
    }

    const openStakeDialog = () => {
        setIsOpenDialog(true);
    }

    const closeStakeDialog = () => {
        if (isLoading) return;
        setIsOpenDialog(false);
        setSelectedNFB({});
    }

    const openUnstakeDialog = () => {
        setIsOpenUnstakeDialog(true);
    }

    const closeUnstakeDialog = () => {
        if (isLoading) return;
        setIsOpenUnstakeDialog(false);
        setSelectedNFB({});
    }

    const updateNFBs = () => {
        const nftIns = new web3.eth.Contract(NFT.ABI, NFT.ADDRESS);
        nftIns.methods.isApprovedForAll(account, NSTAKE.ADDRESS).call().then(result => {
            setIsApproved(result);
        });
        tokens.forEach(async (token, idx) => {
            const tokenURI = await nftIns.methods.tokenURI(token).call();
            const response = await fetch(tokenURI);
            const tokenData = await response.json();
            const { traits } = tokenData;
            let score = 0;
            for (let i in traits) {
                const { rarity: rScore } = RARITY[i][traits[i]];
                score += rScore;
            }
            setNFBs(prevState => ({
                ...prevState,
                [tokenData.name]: {
                    index: idx,
                    rarity: score / 5,
                    ...tokenData
                }
            }));
        });
    }

    const updateStakedNFBs = () => {
        const nftIns = new web3.eth.Contract(NFT.ABI, NFT.ADDRESS);
        status.unft.forEach(async (token, idx) => {
            const tokenURI = await nftIns.methods.tokenURI(token).call();
            const response = await fetch(tokenURI);
            const tokenData = await response.json();
            const { traits } = tokenData;
            let score = 0;
            for (let i in traits) {
                const { rarity: rScore } = RARITY[i][traits[i]];
                score += rScore;
            }
            setNFBs(prevState => ({
                ...prevState,
                [tokenData.name]: {
                    index: idx,
                    rarity: score / 5,
                    ...tokenData
                }
            }));
        });
    }

    const toggleNFB = (nfb) => {
        setSelectedNFB(prevState => ({
            ...prevState,
            [nfb.name]: !selectedNFB[nfb.name]
        }));
    }

    const update = async () => {
        if (!web3.eth) return;
        if (isOpenDialog) updateNFBs();

        const stakeIns = new web3.eth.Contract(NSTAKE.ABI, NSTAKE.ADDRESS);
        const nftIns = new web3.eth.Contract(NFT.ABI, NFT.ADDRESS);

        stakeIns.methods.totalNFTSupply().call().then(tnft => {
            setStatus(prevState => ({
                ...prevState,
                tnft: tnft
            }));
        });

        const { rewardPerBlock } = await stakeIns.methods.rewardTokens(TOKEN.ADDRESS).call();
        const secsPerYear = toBN(60 * 60 * 24 * 365);
        const nftPrice = toBN(await nftIns.methods.PRICE().call());
        const tokenPrice = toBN(toWei("1"));

        const apy = fromWei(toBN(rewardPerBlock).mul(secsPerYear).mul(tokenPrice).div(nftPrice));

        setAPY(apy * 100);

        if (account) {
            nftIns.methods.tokensOfOwner(account).call().then(async tokens => {
                setTokens(tokens);
            });
            stakeIns.methods.getUserStakedTokens(account).call().then(unft => {
                setStatus(prevState => ({
                    ...prevState,
                    unft: unft
                }));
            });
            stakeIns.methods.getUserTotalReward(account, TOKEN.ADDRESS).call().then(reward => {
                setStatus(prevState => ({
                    ...prevState,
                    rewards: reward
                }));
            });
        }
    }

    useEffect(() => {
        update();
    }, [web3, account]);

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
                <Card>
                    <CardContent sx={{ paddingBottom: "16px !important" }}>
                        <Stack direction={"row"} spacing={1} alignItems="center">
                            <Button onClick={() => setActiveTab(0)} sx={{
                                fontSize: theme.spacing(2)
                            }} color="info" variant={activeTab === 0 ? "contained" : "outlined"}>
                                NFT Staking
                            </Button>
                            <Button onClick={() => setActiveTab(1)} sx={{
                                fontSize: theme.spacing(2)
                            }} color="info" variant={activeTab === 1 ? "contained" : "outlined"}>
                                My NFBs
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
                <Card sx={{ mt: 4 }}>
                    <CardContent sx={{ pl: 4, pr: 4 }}>
                        <Typography variant="h4" sx={{
                            fontWeight: "bold"
                        }}>
                            My Earnings
                        </Typography>
                        <Typography>
                            Rewards are automatically withdrawn to your wallet with every Harvest, Stake and Unstake.
                        </Typography>
                        <Divider sx={{ mt: 2, mb: 2 }} />
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent={"space-between"}>
                            <Stack direction={"row"} spacing={1.5} alignItems="center">
                                <Box
                                    component="img"
                                    src={require("../assets/img/mbaby.png")}
                                    alt="mbaby"
                                    sx={{
                                        width: theme.spacing(6),
                                        height: theme.spacing(6)
                                    }}
                                />
                                <Stack justifyContent={"center"}>
                                    <Typography sx={{ fontWeight: "600", lineHeight: theme.spacing(2.25) }}>
                                        0.00 USDT
                                    </Typography>
                                    <Typography color="textSecondary" sx={{ lineHeight: theme.spacing(2.25) }}>
                                        $0.00
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Stack direction={"row"} spacing={1.5} alignItems="center">
                                <Box
                                    component="img"
                                    src={require("../assets/img/usdt.png")}
                                    alt="usdt"
                                    sx={{
                                        width: theme.spacing(6),
                                        height: theme.spacing(6),
                                        p: 0.75
                                    }}
                                />
                                <Stack justifyContent={"center"}>
                                    <Typography sx={{ fontWeight: "600", lineHeight: theme.spacing(2.25) }}>
                                        0.00 USDT
                                    </Typography>
                                    <Typography color="textSecondary" sx={{ lineHeight: theme.spacing(2.25) }}>
                                        $0.00
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Stack direction={"row"} spacing={1.5} alignItems="center">
                                <Box
                                    component="img"
                                    src={require("../assets/img/mbaby.png")}
                                    alt="mbaby"
                                    sx={{
                                        width: theme.spacing(6),
                                        height: theme.spacing(6)
                                    }}
                                />
                                <Stack justifyContent={"center"}>
                                    <Typography sx={{ fontWeight: "600", lineHeight: theme.spacing(2.25) }}>
                                        0.00 USDT
                                    </Typography>
                                    <Typography color="textSecondary" sx={{ lineHeight: theme.spacing(2.25) }}>
                                        $0.00
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Stack direction={"row"} spacing={1.5} alignItems="center">
                                <Box
                                    component="img"
                                    src={require("../assets/img/usdt.png")}
                                    alt="usdt"
                                    sx={{
                                        width: theme.spacing(6),
                                        height: theme.spacing(6),
                                        p: 0.75
                                    }}
                                />
                                <Stack justifyContent={"center"}>
                                    <Typography sx={{ fontWeight: "600", lineHeight: theme.spacing(2.25) }}>
                                        0.00 USDT
                                    </Typography>
                                    <Typography color="textSecondary" sx={{ lineHeight: theme.spacing(2.25) }}>
                                        $0.00
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
                <Grid container sx={{ mt: 4 }} spacing={2}>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent sx={{ position: "relative", pt: 7, pl: 4, pr: 4 }}>
                                <Typography variant="h6" sx={{
                                    bgcolor: "primary.main",
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    padding: theme => theme.spacing(0.5, 1.5),
                                    borderBottomRightRadius: theme => theme.shape.borderRadius
                                }}>
                                    NFB Pool
                                </Typography>
                                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                                    <Typography variant="h5">
                                        EARN
                                        <Box component="span" sx={{ pl: 1, color: "primary.main" }}>
                                            MBABY
                                        </Box>
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: "600" }}>
                                        {(() => {
                                            if (!apy) {
                                                return (
                                                    <Skeleton
                                                        animation="wave"
                                                        sx={{
                                                            minWidth: theme => theme.spacing(10)
                                                        }}
                                                    />
                                                )
                                            }
                                            return `APY: ${apy}%`;
                                        })()}
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            onClick={openUnstakeDialog}
                                            disabled={!account || !status?.unft?.length}
                                            variant="outlined"
                                            color="secondary"
                                        >
                                            Unstake
                                        </Button>
                                        <Button
                                            onClick={openStakeDialog}
                                            disabled={!account || !tokens?.length}
                                            variant="contained"
                                            color="secondary"
                                        >
                                            Stake
                                        </Button>
                                    </Stack>
                                </Stack>
                                <Stack sx={{
                                    pt: 4
                                }} direction={{ xs: "column", sm: "row" }} spacing={4} alignItems="center" justifyContent={"space-between"}>
                                    <Avatar
                                        aria-label="recipe"
                                        src={require("../assets/img/dashboard/nfb.png")}
                                        alt="MBABY_BTC"
                                        sx={{
                                            bgcolor: "rgba(255, 255, 255, .075)",
                                            p: 0.5,
                                            borderRadius: 1,
                                            width: theme.spacing(20),
                                            height: theme.spacing(20),
                                            ["& img"]: {
                                                height: "100%",
                                                width: "100%",
                                            }
                                        }}
                                    />
                                    <Stack sx={{ flexGrow: 1 }} spacing={1.25}>
                                        <Stack direction="row" alignItems={"center"}>
                                            <Typography variant="body1" sx={{ textTransform: "uppercase" }} color="textSecondary">
                                                Total NFBs Staked
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
                                            <Typography variant="body1">
                                                {(() => {
                                                    if (!status.tnft) {
                                                        return (
                                                            <Skeleton
                                                                animation="wave"
                                                                sx={{
                                                                    minWidth: theme => theme.spacing(10)
                                                                }}
                                                            />
                                                        )
                                                    }
                                                    return status.tnft;
                                                })()}
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" alignItems={"center"}>
                                            <Typography variant="body1" sx={{ textTransform: "uppercase" }} color="textSecondary">
                                                My NFBs Staked
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
                                            <Typography variant="body1">
                                                {(() => {
                                                    if (!status.unft) {
                                                        return (
                                                            <Skeleton
                                                                animation="wave"
                                                                sx={{
                                                                    minWidth: theme => theme.spacing(10)
                                                                }}
                                                            />
                                                        )
                                                    }
                                                    return status.unft?.length;
                                                })()}
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" alignItems={"center"}>
                                            <Typography variant="body1" sx={{ textTransform: "uppercase" }} color="textSecondary">
                                                MBABY Earned
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
                                            <Typography variant="body1">
                                                {(() => {
                                                    if (!status.rewards) {
                                                        return (
                                                            <Skeleton
                                                                animation="wave"
                                                                sx={{
                                                                    minWidth: theme => theme.spacing(10)
                                                                }}
                                                            />
                                                        )
                                                    }
                                                    return fn(fromWei(status.rewards));
                                                })()}
                                            </Typography>
                                        </Stack>
                                        <Stack sx={{ pt: 2 }} direction="row" justifyContent={"flex-end"}>
                                            <LoadingButton
                                                loading={isLoading}
                                                onClick={claim}
                                                variant="outlined"
                                                disabled={!status.rewards || status.rewards <= 0}
                                            >
                                                Harvest
                                            </LoadingButton>
                                        </Stack>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
            <Dialog
                maxWidth="xs"
                open={isOpenDialog}
                onClose={closeStakeDialog}
                TransitionProps={{ onEntering: updateNFBs }}
                PaperProps={{
                    sx: {
                        width: "100%",
                        maxWidth: theme => theme.spacing(35)
                    }
                }}
            >
                <DialogTitle>
                    NFB List
                </DialogTitle>
                <DialogContent dividers sx={{
                    padding: 0,
                    maxHeight: 300
                }}>
                    <List sx={{
                        padding: 0
                    }}>
                        {tokens.map(item => {
                            const name = `#${item}`;
                            const nfb = nfbs[`#${item}`];
                            if (!nfb) {
                                return (
                                    <ListItem disablePadding key={name}>
                                        <ListItemButton
                                            disabled
                                            sx={{
                                                borderRadius: 0
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Skeleton variant="rectangular" width={40} height={40} />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Skeleton variant="text" />
                                                }
                                                secondary={
                                                    <Skeleton variant="text" />
                                                }
                                            />
                                            <Skeleton variant="rectangular" width={24} height={24} sx={{
                                                margin: 1.25
                                            }} />
                                        </ListItemButton>
                                    </ListItem>
                                )
                            } else {
                                return (
                                    <ListItem disablePadding key={name}>
                                        <ListItemButton
                                            onClick={() => toggleNFB(nfb)}
                                            sx={{
                                                borderRadius: 0
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    src={`https://ipfs.io/${nfb.image.replace(":/", "/")}`}
                                                    alt={nfb.name}
                                                    sx={{
                                                        bgcolor: theme => theme.palette.background.paper,
                                                        color: "#fff"
                                                    }}
                                                />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={nfb.name}
                                                secondary={`Rarity: ${fn(nfb.rarity)}%`}
                                            />
                                            <Checkbox
                                                checked={Boolean(selectedNFB[nfb.name])}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                )
                            }
                        })}
                    </List>
                </DialogContent>
                <DialogActions sx={{
                    padding: theme => theme.spacing(2, 2),
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <Button
                        fullWidth
                        autoFocus
                        disabled={isLoading}
                        variant="outlined"
                        color="error"
                        onClick={closeStakeDialog}
                    >
                        Cancel
                    </Button>
                    {isApproved ? (
                        <LoadingButton
                            fullWidth
                            loading={isLoading}
                            color="secondary"
                            variant="contained"
                            onClick={stake}
                            disabled={(() => {
                                const selected = Object.values(selectedNFB).filter(item => item === true);
                                if (selected && selected?.length) return false;
                                return true;
                            })()}
                        >
                            Stake
                        </LoadingButton>
                    ) : (
                        <LoadingButton
                            fullWidth
                            loading={isLoading}
                            color="secondary"
                            variant="contained"
                            onClick={approve}
                        >
                            Approve
                        </LoadingButton>
                    )}
                </DialogActions>
            </Dialog>
            <Dialog
                maxWidth="xs"
                open={isOpenUnstakeDialog}
                onClose={closeUnstakeDialog}
                TransitionProps={{ onEntering: updateStakedNFBs }}
                PaperProps={{
                    sx: {
                        width: "100%",
                        maxWidth: theme => theme.spacing(35)
                    }
                }}
            >
                <DialogTitle>
                    Staked NFBs
                </DialogTitle>
                <DialogContent dividers sx={{
                    padding: 0,
                    maxHeight: 300
                }}>
                    <List sx={{
                        padding: 0
                    }}>
                        {status.unft ? status.unft.map(item => {
                            const name = `#${item}`;
                            const nfb = nfbs[`#${item}`];
                            if (!nfb) {
                                return (
                                    <ListItem disablePadding key={name}>
                                        <ListItemButton
                                            disabled
                                            sx={{
                                                borderRadius: 0
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Skeleton variant="rectangular" width={40} height={40} />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Skeleton variant="text" />
                                                }
                                                secondary={
                                                    <Skeleton variant="text" />
                                                }
                                            />
                                            <Skeleton variant="rectangular" width={24} height={24} sx={{
                                                margin: 1.25
                                            }} />
                                        </ListItemButton>
                                    </ListItem>
                                )
                            } else {
                                return (
                                    <ListItem disablePadding key={name}>
                                        <ListItemButton
                                            onClick={() => toggleNFB(nfb)}
                                            sx={{
                                                borderRadius: 0
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    src={`https://ipfs.io/${nfb.image.replace(":/", "/")}`}
                                                    alt={nfb.name}
                                                    sx={{
                                                        bgcolor: theme => theme.palette.background.paper,
                                                        color: "#fff"
                                                    }}
                                                />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={nfb.name}
                                                secondary={`Rarity: ${fn(nfb.rarity)}%`}
                                            />
                                            <Checkbox
                                                checked={Boolean(selectedNFB[nfb.name])}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                )
                            }
                        }) : <></>}
                    </List>
                </DialogContent>
                <DialogActions sx={{
                    padding: theme => theme.spacing(2, 2),
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <Button
                        fullWidth
                        autoFocus
                        disabled={isLoading}
                        variant="outlined"
                        color="error"
                        onClick={closeUnstakeDialog}
                    >
                        Cancel
                    </Button>
                    <LoadingButton
                        fullWidth
                        loading={isLoading}
                        color="secondary"
                        variant="contained"
                        onClick={unstake}
                        disabled={(() => {
                            const selected = Object.values(selectedNFB).filter(item => item === true);
                            if (selected && selected?.length) return false;
                            return true;
                        })()}
                    >
                        Unstake
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default StakeNFBs;