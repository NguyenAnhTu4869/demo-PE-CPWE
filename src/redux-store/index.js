/** Store setup using configureStore method from redux-toolkit */
import { configureStore } from "@reduxjs/toolkit";

/** Where to import slice reducers */
import authSlice from "./auth/auth.slice";
import userSlice from "./user/user.slice";
import sideBarSlice from "./sidebar/sidebar.slice";
import tableSlice from "./table/table.slice";

const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        sideBar: sideBarSlice.reducer,
        user: userSlice.reducer,
        table: tableSlice.reducer,
    },
});

export default store;
