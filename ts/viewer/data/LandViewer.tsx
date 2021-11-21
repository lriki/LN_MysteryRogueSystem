import * as React from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import Box from '@mui/material/Box';
import DataTitleList, { DataTitleListItem } from './DataTitleList';
import { REData } from 'ts/re/data/REData';
import { DatabaseNavigator } from './DatabaseNavigator';
import { dataListWidth } from '../Common';
import { DLandId } from 'ts/re/data/DLand';
import { PropertyGrid, Propery } from '../PropertyGrid';

type Props = RouteComponentProps<{
    id: string | undefined;
}>;

   
export default function LandViewer(props: Props) {
    const history = useHistory();
    
    function getDataTitleList(): DataTitleListItem[] {
        if (REData.lands) {
            return REData.lands.map(x => {
                return {
                    id: x.id,
                    name: `${x.id}: ${x.name}`,
                };
            });
        }
        return [];
    }

    console.log("pops", props.match.params.id);

    const handleDataTitleListItemClick = (id: any) => {
        history.push(`/database/lands/${id}`);
    };

    return (
        <DatabaseNavigator>
            <Box sx={{ display: 'flex', height: "100%" }}>
                <Box sx={{ width: dataListWidth, height: "100%" }}>
                    <DataTitleList items={getDataTitleList()} onClick={handleDataTitleListItemClick} />
                </Box>
                <Box sx={{ flexGrow: 1 }} >
                    { props.match.params.id && Details(Number(props.match.params.id)) }
                </Box>
            </Box>
        </DatabaseNavigator>
    );
}

function Details(id: DLandId) {
    if (id == 0) return (<div />);

    const data = REData.lands[id];

    const properies: Propery[] = [
        { name: "displayName", value: data.name },
    ];

    return (
        <PropertyGrid properies={properies} />
    );
}
