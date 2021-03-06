import React, { useState, useEffect } from "react";
import "../styles/style.scss";
import { ErrorMessage, Formik, Form } from "formik";
import { TextField } from "../components/UI/Form/TextField";
import { EnhancedTable } from "../components/UI/Table/Table";
import { AcademicYearSchema } from "../validation";
import Select from "react-select";
import { YearOptions } from "../components/Navbar/dropdown/DropdownItems";
import { ColumnsSemester } from "../components/UI/Table/TableItems";
import { AcademicUrl, Flag, Warn } from "../api/EndPoint";
import { convertDate, getFormattedDate } from "../function/library";
import { AxiosInstance } from "../api/AxiosClient";
import { useSelector } from "react-redux";
import ErrorMessagePopUp from "../components/UI/Modal/ErrorMessage";
import AuthorizationAPI from "../api/AuthorizationAPI";
import PageNotFound from "../404";

const handleSubmit = async (values, setIsSubmiting, setErrorData) => {
    await AxiosInstance.post(AcademicUrl.create, values, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
        .then((res) => {
            var errorData = {
                code: res.data.code,
                message: res.data.message,
            };
            setErrorData(errorData);
            console.log("Create success");
            setIsSubmiting(false);
        })
        .catch((error) => {
            if (error && error.response) {
                console.log("Error: ", error);
            }
        });
};

const handleGet = async (values, setReturnData, setPagination) => {
    const paramsValue = {
        searchKey: values === null || values.searchKey === null ? null : values.searchKey,
        page: values === null || values.page === null ? 1 : values.page,
        limit: values === null || values.limit === null ? 5 : values.limit,
        sortBy: values === null || values.sortBy === null ? "createdDate" : values.sortBy,
        sortType: values === null || values.sortType === null ? "DESC" : values.sortType,
    };
    await AxiosInstance.get(AcademicUrl.get, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: paramsValue,
    })
        .then((res) => {
            var pagination = {
                page: res.data.data.page,
                size: res.data.data.size,
                totalPages: res.data.data.totalPages,
            };
            var tableData = res.data.data.content.map((content) => {
                var startDate = getFormattedDate(convertDate(content.startDate));
                var endDate = getFormattedDate(convertDate(content.endDate));
                return {
                    id: content.id,
                    year: content.year,
                    semester: content.semester,
                    startDate: startDate,
                    endDate: endDate,
                };
            });
            setReturnData(tableData);
            setPagination(pagination);
        })
        .catch((error) => {
            if (error && error.response) {
                console.log("Error: ", error);
            }
        });
};

const initialValues = {
    year: "",
    semester: "",
    startDate: "",
    endDate: "",
};

function AcademicYear() {
    const [permission, setPermission] = useState(false);
    const [returnData, setReturnData] = useState([]);
    const [returnPagination, setPagination] = useState({});
    const [isSubmiting, setIsSubmiting] = useState(false);
    const [errorData, setErrorData] = useState({
        code: 0,
        message: "ok",
    });
    // const tableAttr = useSelector((state) => state.table);
    const currentPage = useSelector((state) => state.table.page);
    const currentLimit = useSelector((state) => state.table.rowsPerPage);

    const tableDatas = {
        // searchKey: tableAttr.searchText,
        searchKey: null,
        limit: currentLimit,
        page: currentPage,
        sortBy: null,
        sortType: null,
    };

    useEffect(() => {
        AuthorizationAPI(Flag.manageSemester, setPermission);
    }, [permission]);

    useEffect(() => {
        if (permission === true) {
            handleGet(tableDatas, setReturnData, setPagination);
        }
    }, [permission, currentPage, currentLimit]);

    if (isSubmiting === false) {
        handleGet(null, setReturnData, setPagination);
        setIsSubmiting(true);
    }

    if (permission) {
        return (
            <div className='department-page container'>
                <h2 className='page-title'>Semester</h2>
                <div className='layout-form'>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={AcademicYearSchema}
                        onSubmit={(values, { setSubmitting }) => {
                            handleSubmit(values, setIsSubmiting, setErrorData);
                        }}>
                        {({
                            isSubmiting,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            values,
                            errors,
                            touched,
                            setFieldValue,
                        }) => (
                            <Form className='submit-form'>
                                <div className='form-container'>
                                    <div
                                        className='input-section label-mark'
                                        style={{ width: "45%" }}>
                                        <label className='label'>Year</label>
                                        <Select
                                            className='select'
                                            name='year'
                                            id='year'
                                            options={YearOptions}
                                            placeholder={"Select Year"}
                                            onChange={(selectOption) => {
                                                setFieldValue("year", selectOption.value);
                                            }}
                                            onBlur={() => {
                                                handleBlur({ target: { name: "year" } });
                                            }}
                                        />
                                        <ErrorMessage
                                            component='div'
                                            name={"year"}
                                            className='error'
                                        />
                                    </div>
                                    <div className='input-section label-mark'>
                                        <TextField
                                            label={"Semester Name"}
                                            name='semester'
                                            type='text'
                                            placeholder='Semester Name...'
                                        />
                                    </div>
                                    <div className='layout-date'>
                                        <div className='input-section label-mark time first'>
                                            <TextField
                                                label={"Start Date"}
                                                name='startDate'
                                                type='date'
                                            />
                                        </div>
                                        <div className='input-section label-mark time second'>
                                            <TextField
                                                label={"End Date"}
                                                name='endDate'
                                                type='date'
                                            />
                                        </div>
                                    </div>
                                </div>
                                <hr />
                                <div className='list-button'>
                                    <button className={"btn btn-info"} type='reset'>
                                        Refresh
                                    </button>
                                    <button className={"btn btn-success"} type='submit'>
                                        Save
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
                <div className='layout-table'>
                    <EnhancedTable
                        columns={ColumnsSemester}
                        rows={returnData}
                        totalPages={returnPagination.totalPages}
                    />
                </div>
                {errorData.code !== 0 ? (
                    <ErrorMessagePopUp closebtn={setErrorData} errorMess={errorData.message} />
                ) : (
                    <></>
                )}
            </div>
        );
    } else {
        return <PageNotFound warn={Warn.noPermission} />;
    }
}

export default AcademicYear;
