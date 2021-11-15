


import { Box, Tab, Tabs, Typography } from '@mui/material';
import * as React from 'react';
import { BrowserRouter, Route, useHistory } from 'react-router-dom';
import { tr2 } from 'ts/re/Common';
import StateDataEditor from './data/StateDataEditor';
import RootTabs from './RootTabs';

interface Props {
	children?: React.ReactNode;
}

export function AppNavigator(props: Props) {
    const history = useHistory();

    function tabValue(): number | undefined {
        if (history.location.pathname.includes("/database")) return 0;
        if (history.location.pathname.includes("/entities")) return 1;
        return undefined;
    }

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        //setValue(newValue);
        console.log("push!!");
        //history.push("/data");
        history.push("/database");
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue()} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label={tr2("Data")} />
                    <Tab label={tr2("Entities")} />
                </Tabs>
            </Box>
            <Box>
                {props.children}
            </Box>
        </Box>
    );
}
