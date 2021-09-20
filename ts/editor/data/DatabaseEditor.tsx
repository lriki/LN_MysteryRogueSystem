import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import DataTypeList, { DataTypeListItem } from '../DataTypeList';
import { Toolbar, Typography } from '@mui/material';
import DataTitleList, { DataTitleListItem } from './DataTitleList';
import { REData } from 'ts/re/data/REData';
import StateDataEditor from './StateDataEditor';

const drawerWidth = 200;


const dataTypeListItems: DataTypeListItem[] = [
    { id: "entities", name: "エンティティ" },
    { id: "skills", name: "スキル" },
    { id: "states", name: "ステート" },
];

function getDataTitleList(type: string): DataTitleListItem[] {
    console.log("type", type);
    if (type == "entities" && REData.entities) {
        return REData.entities.map(x => {
            return {
                id: x.entity.key,
                name: `${x.id}: ${x.entity.key}`,
            };
        });
    }
    else if (type == "states" && REData.states) {
        return REData.states.map(x => {
            return {
                id: x.key,
                name: `${x.id}: ${x.displayName}`,
            };
        });
    }
    
    return [];
}

export default function DatabaseEditor() {
    const [selectedType, setSelectedType] = React.useState("entities");

    React.useEffect(
        () => {
            console.log(selectedType);
        },
        [selectedType]);

    const handleDataTypeListItemClick = (id: string) => {
        console.log("handleDataTypeListItemClick", id);
        setSelectedType(id);
    };

    const renderEditor = () => {
        if (selectedType == "states") {
            return (<StateDataEditor />);
        }
        else {
            return (<div />);
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <DataTypeList items={dataTypeListItems} onClick={handleDataTypeListItemClick} />
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                {renderEditor()}
            </Box>
        </Box>
    );
}
