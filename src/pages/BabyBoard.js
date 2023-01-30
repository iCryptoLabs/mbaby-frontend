import React, { useContext, useState, useEffect } from 'react';

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';

import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import useActiveWeb3React from "../hooks/useActiveWeb3React";

import { Web3Context } from '../hooks/context';

import { CONTRACTS, RARITY } from '../config';

const { TOKEN, NFT } = CONTRACTS;

const BabyBoard = () => {
    const theme = useTheme();
    const web3 = useContext(Web3Context);

    const { account } = useActiveWeb3React();

    const [nfbs, setNFBs] = useState({});
    const [tokens, setTokens] = useState([]);

    const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    const [balance, setBalance] = useState({
        mbaby: {
            usd: 0,
            token: 0
        },
        btcb: {
            usd: 0,
            token: 0
        }
    });

    const [isOpen, setIsOpen] = useState(false);
    const [activeNFT, setActiveNFT] = useState();

    const fn = (val = 0, decimal = 4) => {
        return Number(Number(val).toFixed(decimal)).toLocaleString();
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

    const updateNFBs = () => {
        const nftIns = new web3.eth.Contract(NFT.ABI, NFT.ADDRESS);
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

    const update = async () => {
        if (!web3.eth) return;

        const tokenIns = new web3.eth.Contract(TOKEN.ABI, TOKEN.ADDRESS);
        // const btcbIns = new web3.eth.Contract(TOKEN.BEP20, TOKEN.BTCB);
        const nftIns = new web3.eth.Contract(NFT.ABI, NFT.ADDRESS);

        if (account) {
            // const btcbBalance = await btcbIns.methods.balanceOf(account).call();
            const tokenBalance = await tokenIns.methods.balanceOf(account).call();
            setBalance({
                mbaby: {
                    usd: 0,
                    token: tokenBalance
                },
                btcb: {
                    usd: 0,
                    token: 0
                }
            });
            nftIns.methods.tokensOfOwner(account).call().then(async (tokens) => {
                setTokens(tokens);
            });
        }
    }

    useEffect(() => {
        if (!tokens.length) return;
        updateNFBs();
    }, [tokens.length]);

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
                <Grid container spacing={4}>
                    <Grid item xs={12} md={3.5}>
                        {isMobile && (
                            <>
                                <Stack direction={{ xs: "column", sm: "row" }} sx={{ mb: 2 }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }}>
                                    <Stack direction="row" alignItems="center" sx={{
                                        borderRadius: 1,
                                        flexGrow: 1,
                                        p: 1,
                                        pl: 2,
                                        pr: 2,
                                        bgcolor: "#0F367D"
                                    }}>
                                        <Stack sx={{ pl: 2, flexGrow: 1 }} justifyContent="space-between">
                                            <Typography sx={{ textAlign: "center" }}>
                                                Total Value Locked (TVL)
                                            </Typography>
                                            <Typography sx={{
                                                fontSize: 26,
                                                fontWeight: 600,
                                                textAlign: "center"
                                            }}>
                                                $0.00
                                            </Typography>
                                            <Typography variant="caption" sx={{
                                                textAlign: "center"
                                            }}>
                                                Across all pools
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" sx={{
                                        borderRadius: 1,
                                        flexGrow: 1,
                                        p: 1,
                                        pl: 2,
                                        pr: 2,
                                        bgcolor: "#0F367D"
                                    }}>
                                        <Stack sx={{ pl: 2, flexGrow: 1 }} justifyContent="space-between">
                                            <Typography sx={{ textAlign: "center" }}>
                                                Total <Box component="b" sx={{
                                                    color: theme => theme.palette.primary.main
                                                }}>
                                                    MBABY
                                                </Box> Locked
                                            </Typography>
                                            <Typography sx={{
                                                fontSize: 26,
                                                fontWeight: 600,
                                                textAlign: "center"
                                            }}>
                                                0.00
                                            </Typography>
                                            <Typography variant="caption" sx={{
                                                textAlign: "center"
                                            }}>
                                                Across all pools
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Stack>
                                <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                            Pancakeswap V2
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                        <Stack direction="row" sx={{
                            borderColor: "#36415F",
                            borderWidth: 1,
                            borderStyle: "solid",
                            borderRadius: 1,
                            p: 1,
                            mb: 2
                        }}>
                            <Card sx={{
                                backgroundColor: "rgba(255, 255, 255, .075)",
                                boxShadow: "none",
                                lineHeight: 0
                            }}>
                                <Box
                                    component="img"
                                    src={require("../assets/img/mbaby.png")}
                                    alt="Meta"
                                    sx={{ height: 68, padding: 4 / 8 }}
                                />
                            </Card>
                            <Stack sx={{ pl: 2 }} justifyContent="space-between">
                                <Typography>
                                    MY <Box component="b" sx={{
                                        color: theme => theme.palette.primary.main
                                    }}>
                                        MBABY
                                    </Box> Balance
                                </Typography>
                                <Typography variant="caption">
                                    {(() => {
                                        if (!balance.mbaby) {
                                            return <Skeleton animation="wave" />
                                        }
                                        return fn(fromWei(balance.mbaby?.token));
                                    })()}
                                </Typography>
                                <Typography>
                                    {(() => {
                                        if (!balance.mbaby) {
                                            return <Skeleton animation="wave" />
                                        }
                                        return `$${fn(fromWei(balance.mbaby?.token))}`;
                                    })()}
                                </Typography>
                            </Stack>
                        </Stack>
                        <Stack direction="row" sx={{
                            borderColor: "#36415F",
                            borderWidth: 1,
                            borderStyle: "solid",
                            borderRadius: 1,
                            p: 1,
                            mb: 2
                        }}>
                            <Card sx={{
                                backgroundColor: "rgba(255, 255, 255, .075)",
                                boxShadow: "none",
                                lineHeight: 0
                            }}>
                                <Box
                                    component="img"
                                    src={require("../assets/img/dashboard/btcb.png")}
                                    alt="Btcb"
                                    sx={{
                                        height: 68,
                                        padding: 10 / 8
                                    }}
                                />
                            </Card>
                            <Stack sx={{ pl: 2 }} justifyContent="space-between">
                                <Typography>
                                    MY <Box component="b" sx={{
                                        color: theme => theme.palette.orangebtc.main
                                    }}>
                                        BTCB
                                    </Box> Balance
                                </Typography>
                                <Typography variant="caption">
                                    {(() => {
                                        if (!balance.btcb) {
                                            return <Skeleton animation="wave" />
                                        }
                                        return fn(fromWei(balance.btcb?.token));
                                    })()}
                                </Typography>
                                <Typography>
                                    {(() => {
                                        if (!balance.btcb) {
                                            return <Skeleton animation="wave" />
                                        }
                                        return `$${fn(fromWei(balance.btcb?.token))}`;
                                    })()}
                                </Typography>
                            </Stack>
                        </Stack>
                        <Card sx={{ mb: 2 }}>
                            <CardHeader
                                avatar={
                                    <Avatar
                                        aria-label="recipe"
                                        src={require("../assets/img/dashboard/BTC-MBABY.png")}
                                        alt="MBABY_BTC"
                                        sx={{
                                            bgcolor: "rgba(255, 255, 255, .075)",
                                            p: 0.5,
                                            ["& img"]: {
                                                height: "100%",
                                                width: "100%",
                                            }
                                        }}
                                    />
                                }
                                sx={{
                                    bgcolor: "#0F367D"
                                }}
                                title="Dividends"
                                titleTypographyProps={{
                                    sx: {
                                        fontSize: theme => theme.spacing(2.125)
                                    }
                                }}
                            />
                            <CardContent>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{
                                                fontSize: 14,
                                                padding: 1,
                                                pt: 0,
                                                pb: 0,
                                                border: "none"
                                            }}>
                                                BTCB Earned
                                            </TableCell>
                                            <TableCell sx={{
                                                fontSize: 14,
                                                padding: 1,
                                                pt: 0,
                                                pb: 0,
                                                border: "none"
                                            }}>
                                                MBABY Earned
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell sx={{
                                                fontSize: 14,
                                                padding: 1,
                                                pt: 0,
                                                pb: 0,
                                                border: "none"
                                            }}>
                                                0
                                            </TableCell>
                                            <TableCell sx={{
                                                fontSize: 14,
                                                padding: 1,
                                                pt: 0,
                                                pb: 0,
                                                border: "none"
                                            }}>
                                                0
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        <Card sx={{ mb: 2 }}>
                            <CardHeader
                                avatar={
                                    <Avatar
                                        aria-label="recipe"
                                        src={require("../assets/img/dashboard/stake.png")}
                                        alt="MBABY_BTC"
                                        sx={{
                                            bgcolor: "rgba(255, 255, 255, .075)",
                                            p: 0.5,
                                            ["& img"]: {
                                                height: "unset",
                                                width: "unset"
                                            }
                                        }}
                                    />
                                }
                                sx={{
                                    bgcolor: "#0F367D"
                                }}
                                title="Staking Rewards"
                                titleTypographyProps={{
                                    sx: {
                                        fontSize: theme => theme.spacing(2.125)
                                    }
                                }}
                            />
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <Avatar
                                            aria-label="recipe"
                                            src={require("../assets/img/dashboard/bear.png")}
                                            alt="MBABY_BTC"
                                            sx={{
                                                bgcolor: "rgba(255, 255, 255, .075)",
                                                p: 0.5,
                                            }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="NFB Pool"
                                        secondary="0 MBABY"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <Avatar
                                            aria-label="recipe"
                                            src={require("../assets/img/dashboard/milk-bottle.png")}
                                            alt="MBABY_BTC"
                                            sx={{
                                                bgcolor: "rgba(255, 255, 255, .075)",
                                                p: 0.5,
                                            }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="MBABY Pool #1"
                                        secondary="0 MBABY"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <Avatar
                                            aria-label="recipe"
                                            src={require("../assets/img/dashboard/milk-bottle.png")}
                                            alt="MBABY_BTC"
                                            sx={{
                                                bgcolor: "rgba(255, 255, 255, .075)",
                                                p: 0.5,
                                            }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="MBABY Pool #2"
                                        secondary="0 MBABY"
                                    />
                                </ListItem>
                            </List>
                        </Card>
                        <Card sx={{ mb: 2 }}>
                            <CardHeader
                                avatar={
                                    <Avatar
                                        aria-label="recipe"
                                        src={require("../assets/img/dashboard/people.png")}
                                        alt="MBABY_BTC"
                                        sx={{
                                            bgcolor: "rgba(255, 255, 255, .075)",
                                            p: 0.5
                                        }}
                                    />
                                }
                                sx={{
                                    bgcolor: "#0F367D"
                                }}
                                title="Referral Rewards"
                                titleTypographyProps={{
                                    sx: {
                                        fontSize: theme => theme.spacing(2.125)
                                    }
                                }}
                            />
                            <CardContent>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{
                                                fontSize: 14,
                                                padding: 1,
                                                pt: 0,
                                                pb: 0,
                                                border: "none"
                                            }}>
                                                Referrals
                                            </TableCell>
                                            <TableCell sx={{
                                                fontSize: 14,
                                                padding: 1,
                                                pt: 0,
                                                pb: 0,
                                                border: "none"
                                            }}>
                                                Earned
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell sx={{
                                                fontSize: 14,
                                                padding: 1,
                                                pt: 0,
                                                pb: 0,
                                                border: "none"
                                            }}>
                                                0
                                            </TableCell>
                                            <TableCell sx={{
                                                fontSize: 14,
                                                padding: 1,
                                                pt: 0,
                                                pb: 0,
                                                border: "none"
                                            }}>
                                                0 MBABY
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={8.5}>
                        {!isMobile && (
                            <>
                                <Stack direction={{ xs: "column", sm: "row" }} sx={{ mb: 2 }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }}>
                                    <Stack direction="row" alignItems="center" sx={{
                                        borderRadius: 1,
                                        flexGrow: 1,
                                        p: 1,
                                        pl: 2,
                                        pr: 2,
                                        bgcolor: "#0F367D"
                                    }}>
                                        <Stack sx={{ pl: 2, flexGrow: 1 }} justifyContent="space-between">
                                            <Typography sx={{ textAlign: "center" }}>
                                                Total Value Locked (TVL)
                                            </Typography>
                                            <Typography sx={{
                                                fontSize: 26,
                                                fontWeight: 600,
                                                textAlign: "center"
                                            }}>
                                                $0.00
                                            </Typography>
                                            <Typography variant="caption" sx={{
                                                textAlign: "center"
                                            }}>
                                                Across all pools
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" sx={{
                                        borderRadius: 1,
                                        flexGrow: 1,
                                        p: 1,
                                        pl: 2,
                                        pr: 2,
                                        bgcolor: "#0F367D"
                                    }}>
                                        <Stack sx={{ pl: 2, flexGrow: 1 }} justifyContent="space-between">
                                            <Typography sx={{ textAlign: "center" }}>
                                                Total <Box component="b" sx={{
                                                    color: theme => theme.palette.primary.main
                                                }}>
                                                    MBABY
                                                </Box> Locked
                                            </Typography>
                                            <Typography sx={{
                                                fontSize: 26,
                                                fontWeight: 600,
                                                textAlign: "center"
                                            }}>
                                                0.00
                                            </Typography>
                                            <Typography variant="caption" sx={{
                                                textAlign: "center"
                                            }}>
                                                Across all pools
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Stack>
                                <Card sx={{ mb: 2 }}>
                                    <CardContent sx={{ position: "relative" }}>
                                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                            Pancakeswap V2
                                        </Typography>
                                        <Box sx={{
                                            width: "100%",
                                            height: theme.spacing(40)
                                        }}>
                                            <iframe
                                                src={`https://teams.bogged.finance/embeds/chart?address=${TOKEN.ADDRESS}&chain=bsc&charttype=line&theme=dark&defaultinterval=15m&showchartbutton=true`}
                                                frameBorder="0"
                                                height="100%"
                                                width="100%"
                                            ></iframe>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                        <Card>
                            <CardContent>
                                <Typography variant="h5">
                                    My Non-Fungible Babies (NFBs)
                                </Typography>
                                <Grid container spacing={6} sx={{ mt: 2 }}>
                                    {tokens.length ? tokens.map(item => {
                                        const name = `#${item}`;
                                        const nfb = nfbs[`#${item}`];
                                        if (!nfb) {
                                            return (
                                                <Grid item key={name} xs={12} md={6} lg={4}>
                                                    <Card component={Stack} sx={{
                                                        bgcolor: "#5E4247",
                                                        position: "relative",
                                                        overflow: "visible",
                                                    }}>
                                                        <Skeleton
                                                            animation="wave"
                                                            variant="rectangular"
                                                            sx={{
                                                                width: "100%",
                                                                height: theme => theme.spacing(20),
                                                                borderRadius: 1
                                                            }}
                                                        />
                                                        <Typography
                                                            component="span"
                                                            sx={{
                                                                top: -8,
                                                                left: -8,
                                                                boxShadow: theme => theme.shadows[4],
                                                                textAlign: "center",
                                                                position: "absolute",
                                                                borderRadius: 1,
                                                                overflow: 'hidden'
                                                            }}
                                                        >
                                                            <Skeleton variant="rectangular" sx={{
                                                                minWidth: theme => theme.spacing(8),
                                                                bgcolor: "#FFE187",
                                                            }} />
                                                        </Typography>
                                                        <Typography
                                                            component="span"
                                                            sx={{
                                                                top: -8,
                                                                right: -8,
                                                                boxShadow: theme => theme.shadows[4],
                                                                textAlign: "center",
                                                                position: "absolute",
                                                                borderRadius: 1,
                                                                overflow: 'hidden'
                                                            }}
                                                        >
                                                            <Skeleton variant="rectangular" sx={{
                                                                minWidth: theme => theme.spacing(8),
                                                                bgcolor: "#FFE187",
                                                            }} />
                                                        </Typography>
                                                    </Card>
                                                </Grid>
                                            )
                                        } else {
                                            return (
                                                <Grid onClick={() => {
                                                    setActiveNFT(nfb);
                                                    setIsOpen(true);
                                                }} key={name} item xs={12} md={6} lg={4}>
                                                    <Card component={Stack} sx={{
                                                        bgcolor: "#5E4247",
                                                        position: "relative",
                                                        overflow: "visible",
                                                        ["&::before"]: {
                                                            position: "absolute",
                                                            top: 0,
                                                            left: 0,
                                                            bottom: 0,
                                                            right: 0,
                                                            bgcolor: "secondary.main",
                                                            backdropFilter: "blur(3px)",
                                                            borderRadius: 1,
                                                            content: "' '",
                                                            opacity: 0,
                                                            display: "none"
                                                        },
                                                        "&:hover": {
                                                            cursor: "pointer",
                                                            ["&::before"]: {
                                                                display: "flex",
                                                                opacity: 0.25,
                                                            }
                                                        }
                                                    }}>
                                                        <Stack
                                                            justifyContent="center"
                                                            alignItems="center"
                                                            sx={{
                                                                minHeight: theme => theme.spacing(20)
                                                            }}
                                                        >
                                                            <Box
                                                                component="img"
                                                                src={`https://ipfs.io/${nfb.image.replace(":/", "/")}`}
                                                                alt="NFB"
                                                                sx={{
                                                                    width: "100%",
                                                                    borderRadius: 1,
                                                                    zIndex: 2
                                                                }}
                                                            />
                                                            <Skeleton
                                                                animation="wave"
                                                                variant="rectangular"
                                                                sx={{
                                                                    width: "100%",
                                                                    position: "absolute",
                                                                    zIndex: 1,
                                                                    height: theme => theme.spacing(20)
                                                                }}
                                                            />
                                                        </Stack>
                                                        <Typography
                                                            component="span"
                                                            sx={{
                                                                bgcolor: "#FFE187",
                                                                color: "#00215E",
                                                                p: 0.5,
                                                                pl: 1.5,
                                                                pr: 1.5,
                                                                top: -8,
                                                                left: -8,
                                                                boxShadow: theme => theme.shadows[4],
                                                                textAlign: "center",
                                                                fontSize: 14,
                                                                fontWeight: 700,
                                                                position: "absolute",
                                                                borderRadius: 1,
                                                                zIndex: 10
                                                            }}
                                                        >
                                                            {nfb.name}
                                                        </Typography>
                                                        <Typography
                                                            component="span"
                                                            sx={{
                                                                bgcolor: "#FFE187",
                                                                color: "#00215E",
                                                                p: 0.5,
                                                                pl: 1.5,
                                                                pr: 1.5,
                                                                top: -8,
                                                                right: -8,
                                                                fontSize: 12,
                                                                boxShadow: theme => theme.shadows[4],
                                                                textAlign: "center",
                                                                position: "absolute",
                                                                borderRadius: 1,
                                                                zIndex: 10
                                                            }}
                                                        >
                                                            {fn(nfb.rarity)}%
                                                        </Typography>
                                                    </Card>
                                                </Grid>
                                            )
                                        }
                                    }) : (
                                        account ? (
                                            <Grid item xs={12} sx={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                pb: theme => theme.spacing(4)
                                            }}>
                                                <CircularProgress />
                                            </Grid>
                                        ) : (
                                            <Grid item xs={12} sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                gap: 2,
                                                pb: theme => theme.spacing(4)
                                            }}>
                                                <Box
                                                    component="img"
                                                    src={require("../assets/img/dashboard/empty-box.png")}
                                                    alt="empty box"
                                                    sx={{
                                                        width: theme => theme.spacing(15)
                                                    }}
                                                />
                                                <Typography>
                                                    No NFBs Yet.
                                                </Typography>
                                            </Grid>
                                        )
                                    )}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
            <Dialog onClose={() => setIsOpen(false)} open={isOpen}>
                {activeNFT && (
                    <Grid container>
                        <Grid item xs={12} sm={6} sx={{ lineHeight: 0 }}>
                            <Box
                                component="img"
                                src={`https://ipfs.io/${activeNFT.image.replace(":/", "/")}`}
                                alt="NFB"
                                sx={{
                                    width: "100%",
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} sx={{ p: 2 }}>
                            <Typography variant="h5">
                                {activeNFT.name}
                            </Typography>
                            <Divider textAlign="left" sx={{ mb: 2 }}>
                                <Typography variant="caption" color="textSecondary">
                                    Attributes
                                </Typography>
                            </Divider>
                            {Object.keys(activeNFT["traits"]).map(key => {
                                const traitsValue = RARITY[key][activeNFT["traits"][key]];
                                return (
                                    <Stack key={key} direction="row" alignItems={"center"}>
                                        <Typography variant="overline" color="textSecondary">
                                            {key}
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
                                            {traitsValue.name}
                                        </Typography>
                                    </Stack>
                                );
                            })}
                        </Grid>
                    </Grid>
                )}
            </Dialog>
        </Box >
    )
}

export default BabyBoard;
