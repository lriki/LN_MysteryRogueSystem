


import { Box, List, ListItem, ListItemButton, ListItemText, Tab, Tabs, Typography } from '@mui/material';
import * as React from 'react';
import { BrowserRouter, Route, useHistory } from 'react-router-dom';
import { tr2 } from 'ts/re/Common';
import { AppNavigator } from '../AppNavigator';
import { DataTypeListItem } from '../DataTypeList';

const dataTypeListWidth = 160;

const dataTypeListItems: DataTypeListItem[] = [
    { id: "entities", name: "Entities" },
    { id: "skills", name: "Skills" },
    { id: "states", name: "States" },
];

function a11yProps(index: number) {
    return {
      id: `vertical-tab-${index}`,
      'aria-controls': `vertical-tabpanel-${index}`,
    };
  }

interface Props {
	children?: React.ReactNode;
}

export function DatabaseNavigator(props: Props) {
    const history = useHistory();

    function selectedIndex(): number | undefined {
        if (history.location.pathname.includes("/entities")) return 0;
        if (history.location.pathname.includes("/skills")) return 1;
        if (history.location.pathname.includes("/states")) return 2;
        return undefined;
    }

    const handleChange = (item: DataTypeListItem) => {
        console.log("push!!");
        history.push("/database/states");
    };

    const handleItemClick = (item: DataTypeListItem) => {
        handleChange(item);
    }

    const renderItem = (item: DataTypeListItem) => {
        return (
            <ListItem key={item.id} disablePadding>
                <ListItemButton sx={{minHeight: 32}} onClick={() => handleItemClick(item)}>
                    <ListItemText primary={item.name} primaryTypographyProps={{ fontSize: 14, fontWeight: 'medium' }} />
                </ListItemButton>
            </ListItem>
        );
    }

    const renderItems = () => {
        return (<>{dataTypeListItems.map(item => renderItem(item))}</>);
    }
    
    const handleChanged = (event: React.SyntheticEvent, newValue: number) => {
        history.push("/database/states");
    };

    const renderTabItem = (item: DataTypeListItem, index: number) => {
        return (
            <Tab label={item.name} {...a11yProps(index)} />
        );
    }

    const renderTabList = () => {
        return (<Tabs
            orientation="vertical"
            variant="scrollable"
            value={selectedIndex()}
            onChange={handleChanged}
            aria-label="Vertical tabs example"
            sx={{ borderRight: 1, borderColor: 'divider', height: "100%", minWidth: dataTypeListWidth }}
          >
              {dataTypeListItems.map((item, i) => renderTabItem(item, i))}
          </Tabs>);
    }

    return (
        <AppNavigator>
            <Box sx={{ width: '100%', display: 'flex', height: "100%" }}>
                {renderTabList()}
                <Box sx={{ height: "100%", width: "100%" }}>
                    {props.children}
                </Box>
            </Box>
        </AppNavigator>
    );
}
