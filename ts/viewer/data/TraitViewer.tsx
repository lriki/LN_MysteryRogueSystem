import * as React from 'react';
import Box from '@mui/material/Box';
import DataTitleList, { DataTitleListItem } from './DataTitleList';
import { REData } from 'ts/re/data/REData';
import { DatabaseNavigator } from './DatabaseNavigator';
import { dataListWidth } from '../Common';

export default function TraitViewer() {
    function getDataTitleList(): DataTitleListItem[] {
        if (REData.traits) {
            return REData.traits.map(x => {
                return {
                    id: x.id,
                    name: `${x.id}: ${x.key}`,
                };
            });
        }
        return [];
    }

    const handleDataTitleListItemClick = (id: any) => {
    };

    return (
        <DatabaseNavigator>
            <Box sx={{ display: 'flex', height: "100%" }}>
                <Box sx={{ width: dataListWidth, height: "100%" }}>
                    <DataTitleList items={getDataTitleList()} onClick={handleDataTitleListItemClick} />
                </Box>
                <Box sx={{ flexGrow: 1 }} >
                    TODO:
                </Box>
            </Box>
        </DatabaseNavigator>
    );
}
