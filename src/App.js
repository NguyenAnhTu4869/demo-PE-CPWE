import React, { useState, Fragment } from "react";
import { useSelector } from "react-redux";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AcademicYear from "./pages/AcademicYear";
import Department from "./pages/Department";
import Dashboard from "./pages/Dashboard";
import ManageUser from "./pages/ManageUser";
import PermissionManagement from "./pages/PermissionManagement";
import Tags from "./pages/Tags";
import Topic from "./pages/Topic";
import SubmitPage from "./pages/SubmitPage";
import RoleManagement from "./pages/RoleManagement";
import UserDetails from "./pages/UserDetails";
import SubmitIdea from "./components/CreateIdea/SubmitIdea";
import Terms from "./pages/Terms";
import IdeaDetail from "./pages/IdeaDetail";
import PageNotFound from "./404";
import { Warn } from "./api/EndPoint";

function GlobalRoute({ children, ...props }) {
    return (
        <BrowserRouter>
            <Routes>{children}</Routes>
        </BrowserRouter>
    );
}

function PrivateRoute({ children, ...props }) {
    return (
        <Fragment>
            <BrowserRouter>
                <Navbar onClickCreateBtn={props.openModalHandler} />
                <Routes>{children}</Routes>
                <SubmitIdea
                    isShowForm={props.isOpenModal}
                    closeModalHandler={props.openModalHandler}
                />
            </BrowserRouter>
        </Fragment>
    );
}

function App() {
    const [isOpenModal, setIsOpenModal] = useState(false);
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

    const openModalHandler = () => {
        setIsOpenModal((prevIsOpenModal) => !prevIsOpenModal);
    };

    return (
        <Fragment>
            {isLoggedIn && (
                <PrivateRoute openModalHandler={openModalHandler} isOpenModal={isOpenModal}>
                    <Route path='/' exact element={<Home />} />
                    <Route path='/login' exact element={<Navigate to='/' />} />
                    <Route path='/dashboard' exact element={<Dashboard />} />
                    <Route path='/management/manage-user' exact element={<ManageUser />} />
                    {/* <Route
                        path='/management/perms-management'
                        exact
                        element={<PermissionManagement />}
                    /> */}
                    <Route path='/category/semester' exact element={<AcademicYear />} />
                    <Route path='/category/department' exact element={<Department />} />
                    <Route path='/category/tags' exact element={<Tags />} />
                    <Route path='/category/topic' exact element={<Topic />} />
                    <Route path='/submit-page' exact element={<SubmitPage />} />
                    <Route path='/management/role-management' exact element={<RoleManagement />} />
                    <Route path='/user/user-settings' exact element={<UserDetails />} />
                    <Route path='/terms-conditions' exact element={<Terms />} />
                    <Route path='/idea-detail/:id' element={<IdeaDetail />} />
                    <Route path='*' element={<Navigate to='/404' />} />
                    <Route path='/404' exact element={<PageNotFound warn={Warn.noExist} />} />
                </PrivateRoute>
            )}
            {!isLoggedIn && (
                <GlobalRoute>
                    <Route path='/' exact element={<Navigate to='/login' />} />
                    <Route path='/login' exact element={<Login />} />
                    <Route path='/dashboard' exact element={<Navigate to='/login' />} />
                    <Route path='/manage-user' exact element={<Navigate to='/login' />} />
                    <Route path='/category/semester' exact element={<Navigate to='/login' />} />
                    <Route path='/category/department' exact element={<Navigate to='/login' />} />
                    <Route path='/category/tags' exact element={<Navigate to='/login' />} />
                    <Route path='/category/topic' exact element={<Navigate to='/login' />} />
                    <Route path='/submit-page' exact element={<Navigate to='/login' />} />
                    <Route path='/account-settings' exact element={<Navigate to='/login' />} />
                    <Route path='/user/user-settings' exact element={<Navigate to='/login' />} />
                    <Route path='/terms-conditions' exact element={<Navigate to='/login' />} />
                    <Route path='*' element={<Navigate to='/404' />} />
                    <Route path='/404' exact element={<PageNotFound warn={Warn.noExist} />} />
                </GlobalRoute>
            )}
        </Fragment>
    );
}

export default App;
