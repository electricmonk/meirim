import { useEffect } from 'react';
import { setTreeData } from 'redux/tree/slice';
import { getTreeData } from './controller';
import { useDispatch } from 'react-redux';

const NATIONAL_OFFICER_WEBSITE = 'https://www.gov.il/he/departments/guides/pro_felling_trees';
const JERUSALEM_OFFICER_WEBSITE = 'https://www.jerusalem.muni.il/he/residents/environment/improvingcity/trees-conservation/';

export const useDataHandler = (treeId) => {
	const dispatch = useDispatch();
	useEffect(() => {
		window.scrollTo(0, 0);
		const fetchData = async () => {
			const response = await getTreeData(treeId);
			const {
				place, street, street_number, action, trees_per_permit, permit_number,
				start_date, end_date, total_trees, reason_short, reason_detailed,
				geom, gush, helka, regional_office, person_request_name, last_date_to_objection } = response.data;

			const url = (place === 'ירושלים') ? JERUSALEM_OFFICER_WEBSITE : NATIONAL_OFFICER_WEBSITE;

			dispatch(setTreeData({
				treeData: {
					place, street, street_number, action, trees_per_permit, permit_number,
					start_date, end_date, total_trees, url, reason_short, reason_detailed,
					geom, gush, helka, regional_office, person_request_name, last_date_to_objection
				}
			}));
		};

		fetchData();
	}, [treeId, dispatch]);
};
