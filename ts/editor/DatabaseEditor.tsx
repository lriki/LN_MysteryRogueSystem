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
import DataTypeList, { DataTypeListItem } from './DataTypeList';
import { Toolbar, Typography } from '@mui/material';
import DataTitleList, { DataTitleListItem } from './DataTitleList';
import { REData } from 'ts/re/data/REData';

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

    return (
        <Box sx={{ display: 'flex' }}>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <DataTypeList items={dataTypeListItems} onClick={handleDataTypeListItemClick} />
            </Box>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <DataTitleList items={getDataTitleList(selectedType)} onClick={handleDataTypeListItemClick} />
            </Box>
            
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Typography paragraph>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                    tempor incididunt ut labore et dolore magna aliqua. Rhoncus dolor purus non
                    enim praesent elementum facilisis leo vel. Risus at ultrices mi tempus
                    imperdiet. Semper risus in hendrerit gravida rutrum quisque non tellus.
                    Convallis convallis tellus id interdum velit laoreet id donec ultrices.
                    Odio morbi quis commodo odio aenean sed adipiscing. Amet nisl suscipit
                    adipiscing bibendum est ultricies integer quis. Cursus euismod quis viverra
                    nibh cras. Metus vulputate eu scelerisque felis imperdiet proin fermentum
                    leo. Mauris commodo quis imperdiet massa tincidunt. Cras tincidunt lobortis
                    feugiat vivamus at augue. At augue eget arcu dictum varius duis at
                    consectetur lorem. Velit sed ullamcorper morbi tincidunt. Lorem donec massa
                    sapien faucibus et molestie ac.
                </Typography>
                <Typography paragraph>
                    Consequat mauris nunc congue nisi vitae suscipit. Fringilla est ullamcorper
                    eget nulla facilisi etiam dignissim diam. Pulvinar elementum integer enim
                    neque volutpat ac tincidunt. Ornare suspendisse sed nisi lacus sed viverra
                    tellus. Purus sit amet volutpat consequat mauris. Elementum eu facilisis
                    sed odio morbi. Euismod lacinia at quis risus sed vulputate odio. Morbi
                    tincidunt ornare massa eget egestas purus viverra accumsan in. In hendrerit
                    gravida rutrum quisque non tellus orci ac. Pellentesque nec nam aliquam sem
                    et tortor. Habitant morbi tristique senectus et. Adipiscing elit duis
                    tristique sollicitudin nibh sit. Ornare aenean euismod elementum nisi quis
                    eleifend. Commodo viverra maecenas accumsan lacus vel facilisis. Nulla
                    posuere sollicitudin aliquam ultrices sagittis orci a.
                </Typography>
            </Box>
        </Box>
    );
}
