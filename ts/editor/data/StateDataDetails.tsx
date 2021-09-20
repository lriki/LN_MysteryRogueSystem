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
import { Paper, Stack, styled, Toolbar, Typography } from '@mui/material';
import DataTitleList, { DataTitleListItem } from './DataTitleList';
import { REData } from 'ts/re/data/REData';
import { DStateId } from 'ts/re/data/DState';

interface Props {
    id: DStateId,
}
const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));
  
export default function StateDataDetails(props: Props) {
    console.log("StateDataDetails", props);
    if (props.id == 0) return (<div />);

    const data = REData.states[props.id];

    return (
        <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1, sm: 2, md: 4 }}
            >
            <Item>{data.displayName}</Item>
            <Item>Item 2</Item>
            <Item>Item 3</Item>
        </Stack>
    );
}
