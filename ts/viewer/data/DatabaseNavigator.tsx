


import { Box, List, ListItem, ListItemButton, ListItemText, Tab, Tabs, Typography } from '@mui/material';
import * as React from 'react';
import { BrowserRouter, Route, useHistory } from 'react-router-dom';
import { tr2 } from 'ts/re/Common';
import { AppNavigator } from '../AppNavigator';
import { DataTypeListItem } from '../DataTypeList';

const dataTypeListWidth = 160;

const dataTypeListItems: DataTypeListItem[] = [
    { id: "entities", path: "/database/entities", name: "Entities" },
    { id: "skills", path: "/database/skills", name: "Skills" },
    { id: "states", path: "/database/states", name: "States" },
    { id: "traits", path: "/database/traits", name: "Traits" },
    { id: "lands", path: "/database/lands", name: "Lands" },
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
        for (let i = 0; i < dataTypeListItems.length; i++) {
            if (history.location.pathname.includes(dataTypeListItems[i].path)) {
                return i;
            }
        }
        return undefined;
    }

    const handleChanged = (event: React.SyntheticEvent, newValue: number) => {
        history.push(dataTypeListItems[newValue].path);
        //history.push("/database/states");
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
