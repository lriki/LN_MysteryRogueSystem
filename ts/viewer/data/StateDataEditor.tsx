import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import DataTypeList, { DataTypeListItem } from '../DataTypeList';
import { Toolbar, Typography } from '@mui/material';
import DataTitleList, { DataTitleListItem } from './DataTitleList';
import { REData } from 'ts/re/data/REData';
import StateDataDetails from './StateDataDetails';
import { DStateId } from 'ts/re/data/DState';
import { AppNavigator } from '../AppNavigator';
import { DatabaseNavigator } from './DatabaseNavigator';

const drawerWidth = 200;


function getDataTitleList(): DataTitleListItem[] {
    if (REData.states) {
        return REData.states.map(x => {
            return {
                id: x.id,
                name: `${x.id}: ${x.displayName}`,
            };
        });
    }
    
    return [];
}

export default function StateDataEditor() {
    const [selectedData, setSelectedData] = React.useState<DStateId>(0);


    React.useEffect(
        () => {
            console.log(selectedData);
        },
        [selectedData]);

    const handleDataTitleListItemClick = (id: any) => {
        console.log("handleDataTypeListItemClick", id);
        setSelectedData(id);
    };

    return (
        <DatabaseNavigator>
            <Box sx={{ display: 'flex', height: "100%" }}>
                <Box sx={{ width: { sm: drawerWidth }, height: "100%" }}>
                    <DataTitleList items={getDataTitleList()} onClick={handleDataTitleListItemClick} />
                </Box>
                <Box sx={{ flexGrow: 1 }} >
                    <StateDataDetails id={selectedData} />
                </Box>
            </Box>
        </DatabaseNavigator>
    );
}
