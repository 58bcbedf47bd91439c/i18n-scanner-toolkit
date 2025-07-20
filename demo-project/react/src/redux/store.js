import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { settingSlice } from "./slice/setting.slice"

const rootReducer = combineReducers({
    setting: settingSlice.reducer,
})
const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => [...getDefaultMiddleware()],
    devTools: true,
})

export default store