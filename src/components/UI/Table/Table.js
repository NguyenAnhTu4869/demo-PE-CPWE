import React, { useState, Fragment, useEffect } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import { visuallyHidden } from "@mui/utils";
import EditIcon from "@mui/icons-material/Edit";
import TrashIcon from "@mui/icons-material/Delete";
import UpArrow from "@mui/icons-material/ArrowDropUp";
import ConfirmDialog from "../Modal/ConfirmDialog";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Pagination from "@mui/material/Pagination";
import ViewListPopUp from "../Modal/ViewListPopUp";
import SearchBar from "../SearchBar/SearchBar";
import Stack from "@mui/material/Stack";
import { pageActions } from "../../../redux-store/table/table.slice";
import { Link } from "react-router-dom";

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === "desc"
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

function EnhancedTableHead(props) {
    const { order, orderBy, onRequestSort, columns } = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    const sortType = order === "desc" ? "sorted descending" : "sorted ascending";
    const sortColumnTable = (columnId) => {
        if (orderBy === columnId) {
            return (
                <Box component='span' sx={visuallyHidden}>
                    {sortType}
                </Box>
            );
        }
        return null;
    };

    return (
        <TableHead>
            <TableRow>
                {columns.map((column) => (
                    <TableCell
                        key={column.id}
                        align={column.align}
                        sortDirection={orderBy === column.id ? order : false}
                        width={column.width}>
                        <TableSortLabel
                            active={orderBy === column.id}
                            direction={orderBy === column.id ? order : "asc"}
                            onClick={createSortHandler(column.id)}
                            IconComponent={UpArrow}
                            style={column.style}>
                            {column.label}
                            {sortColumnTable(column.id)}
                        </TableSortLabel>
                    </TableCell>
                ))}
                {props.isEditCol ? (
                    <TableCell key='header-edit' align='center' style={{ width: "5%" }}>
                        Edit
                    </TableCell>
                ) : (
                    <Fragment />
                )}
                {props.isDeleteCol ? (
                    <TableCell key='header-delete' align='center' style={{ width: "5%" }}>
                        Delete
                    </TableCell>
                ) : (
                    <Fragment />
                )}
                {props.isDisableCol ? (
                    <TableCell key='header-disabled' align='center' style={{ width: "5%" }}>
                        Disabled
                    </TableCell>
                ) : (
                    <Fragment />
                )}
                {props.isViewCol ? (
                    <TableCell key='header-view' align='center' style={{ width: "5%" }}>
                        View
                    </TableCell>
                ) : (
                    <Fragment />
                )}
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.oneOf(["asc", "desc"]).isRequired,
    orderBy: PropTypes.string.isRequired,
};

export const EnhancedTable = ({
    columns,
    rows,
    totalPages,
    setFieldValue,
    formikValue,
    setOptionValues,
    setDeleteCategoryId,
    deleteTag,
    ...props
}) => {
    const dispatch = useDispatch();
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("ID");
    const [currentPage, setCurrentPage] = useState(1);
    const [currentLimit, setCurrentLimit] = useState(5);
    const [searchKey, setSearchKey] = useState(null);
    const [itemIndex, setItemIndex] = useState(null);
    const [openPopUp, setOpenPopUp] = useState({
        isOpen: false,
        itemList: [],
    });
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: "",
        subTitle: "",
    });

    const searchDataHandler = (data) => {
        setSearchKey(data);
    };

    useEffect(() => {
        if (currentLimit === 0 && currentPage === 0) {
            return;
        }
        dispatch(
            pageActions.updateTableAttribute({
                page: currentPage,
                rowsPerPage: currentLimit,
                searchText: searchKey,
            })
        );
        setCurrentPage(currentPage);
        setCurrentLimit(currentLimit);
    }, [currentPage, currentLimit, searchKey]);

    useEffect(() => {
        if (itemIndex === null) {
            return;
        }
        dispatch(
            pageActions.updateItemIndex({
                itemIndex: itemIndex,
            })
        );
    }, [itemIndex]);

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setCurrentLimit(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };

    const handleDeleteTag = () => {
        deleteTag();
    };

    const handleEdit = (setFieldValue, setOptionValues, types, index) => {
        if (types === "user") {
            setFieldValue("firstname", rows[index].firstname);
            setFieldValue("lastname", rows[index].lastname);
            setFieldValue("address", rows[index].address);
            setFieldValue("sex", rows[index].sex);
            setFieldValue("email", rows[index].email);
            setFieldValue("phone", rows[index].phone);
            setFieldValue("departmentId", rows[index].departmentId);
            setFieldValue("roleId", rows[index].roleId);
            setFieldValue("userId", rows[index].id);
        } else {
            setFieldValue("roleName", rows[index].roleName);
            setFieldValue("id", rows[index].id);
            setOptionValues(rows[index].listItem);
        }
    };

    return (
        <Fragment>
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
                <SearchBar retrieveSearchKey={searchDataHandler} />
                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader aria-label='sticky table'>
                        <EnhancedTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            columns={columns}
                            isEditCol={props.hasEditedBtn}
                            isDeleteCol={props.hasDeletedBtn}
                            isDisableCol={props.hasDisabledBtn}
                            isViewCol={props.hasViewedBtn}
                        />
                        <TableBody>
                            {stableSort(rows, getComparator(order, orderBy)).map((row, index) => {
                                return (
                                    <TableRow hover role='checkbox' tabIndex={-1} key={row.id}>
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell key={column.id} align={column.align}>
                                                    {column.url === true ? (
                                                        <Link to={`${row.url}`}>
                                                            {column.format &&
                                                            typeof value === "number"
                                                                ? column.format(value)
                                                                : value}
                                                        </Link>
                                                    ) : (
                                                        <>
                                                            {column.format &&
                                                            typeof value === "number"
                                                                ? column.format(value)
                                                                : value}
                                                        </>
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                        {props.hasEditedBtn ? (
                                            <TableCell key={index + 2} align={"center"}>
                                                <EditIcon
                                                    style={{
                                                        fill: "#FFC20E",
                                                        fontSize: "20px",
                                                    }}
                                                    onClick={() => {
                                                        handleEdit(
                                                            setFieldValue,
                                                            setOptionValues,
                                                            props.type,
                                                            index
                                                        );
                                                        setItemIndex(index);
                                                    }}
                                                />
                                            </TableCell>
                                        ) : (
                                            <Fragment />
                                        )}
                                        {props.hasDeletedBtn ? (
                                            <TableCell key={index + 3} align={"center"}>
                                                <TrashIcon
                                                    style={{
                                                        fill: "#EB1C24",
                                                        fontSize: "20px",
                                                    }}
                                                    onClick={() => {
                                                        setConfirmDialog({
                                                            isOpen: true,
                                                            title: "Are you sure you want to delete this record?",
                                                            subTitle:
                                                                "You can't undo this operetion",
                                                        });
                                                        setDeleteCategoryId(row.id);
                                                    }}
                                                />
                                            </TableCell>
                                        ) : (
                                            <Fragment />
                                        )}
                                        {props.hasDisabledBtn ? (
                                            <TableCell key={index + 4} align={"center"}>
                                                <DoDisturbIcon
                                                    style={{
                                                        fill: "#636E72",
                                                        fontSize: "20px",
                                                    }}
                                                    onClick={() => {
                                                        setConfirmDialog({
                                                            isOpen: true,
                                                            title: "Are you sure you want to disabled this record?",
                                                            subTitle:
                                                                "You can enable it again before final closure date",
                                                            selectDisable: row.id,
                                                        });
                                                    }}
                                                />
                                            </TableCell>
                                        ) : (
                                            <Fragment />
                                        )}
                                        {props.hasViewedBtn ? (
                                            <TableCell key={index + 5} align={"center"}>
                                                <VisibilityIcon
                                                    style={{
                                                        fontSize: "20px",
                                                    }}
                                                    onClick={() => {
                                                        setOpenPopUp({
                                                            isOpen: true,
                                                            itemList: row.listItem,
                                                        });
                                                        // setOpenPopUp(true)
                                                    }}
                                                />
                                            </TableCell>
                                        ) : (
                                            <Fragment />
                                        )}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Stack direction='row' spacing={2}>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        rowsPerPage={currentLimit}
                        component='div'
                        count={-1}
                        page={currentPage}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        ActionsComponent={() => {
                            return <Fragment />;
                        }}
                        labelDisplayedRows={() => {
                            return <Fragment />;
                        }}
                    />
                    <Pagination
                        onChange={handleChangePage}
                        count={totalPages}
                        page={currentPage}
                        color='primary'
                        variant='outlined'
                        shape='rounded'
                        showFirstButton={true}
                        showLastButton={true}
                    />
                </Stack>
                <ConfirmDialog
                    confirmDialog={confirmDialog}
                    setConfirmDialog={setConfirmDialog}
                    deleteTag={handleDeleteTag}
                />
                <ViewListPopUp openPopUp={openPopUp} setOpenPopUp={setOpenPopUp} />
            </Paper>
        </Fragment>
    );
};
