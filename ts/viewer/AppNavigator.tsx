


import { Box, Tab, Tabs, Typography } from '@mui/material';
import * as React from 'react';
import { BrowserRouter, Route, useHistory } from 'react-router-dom';
import { tr2 } from 'ts/re/Common';
import StateDataEditor from './data/StateDataEditor';

interface Props {
	children?: React.ReactNode;
}

export function AppNavigator(props: Props) {
    const ref1 = React.useRef<HTMLDivElement>(null);
    const [tabHeight, setTabHeight] = React.useState("100px");
    const history = useHistory();

    React.useEffect( () => {
        if(ref1.current){
            setTabHeight(`calc(100% - ${ref1.current.offsetHeight}px)`);
        }

    }, [ref1]);

    function tabValue(): number | undefined {
        if (history.location.pathname.includes("/database")) return 0;
        if (history.location.pathname.includes("/entities")) return 1;
        return undefined;
    }

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        history.push("/database");
    };

    return (
        <Box sx={{ height: "100vh", width: '100%' }}>
            <Box ref={ref1} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue()} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label={tr2("Data")} />
                    <Tab label={tr2("Entities")} />
                </Tabs>
            </Box>
            <Box sx={{ height: tabHeight, width: '100%' }}>
                {props.children}
            </Box>
        </Box>
    );
}
