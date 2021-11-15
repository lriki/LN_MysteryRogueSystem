




import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { Paper, Stack, styled, Toolbar, Typography } from '@mui/material';
import { REData } from 'ts/re/data/REData';
import { DStateId } from 'ts/re/data/DState';
import { Type } from 'typescript';

export interface Propery {
    name: string,
    value: any,
}

interface Props {
    properies: Propery[];
}

const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));
  
export function PropertyGrid(props: Props) {


    const renderItem = (p: Propery) => {
        return (
            <Box sx={{ display: 'flex', p: 1 }}>
                <Box sx={{ width: 200 }}>
                    {p.name}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                    {p.value.toString()}
                </Box>
            </Box>
        );
    }

    return (
        <Stack direction="column">
            {props.properies.map(p => renderItem(p))}
        </Stack>
    );
}
