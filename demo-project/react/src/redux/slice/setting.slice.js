import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
const initialState = {
    i18nextLng: null,
}
export const settingSlice = createSlice({
    name: "setting",
    initialState,
    reducers: {
        setI18nextLng(state, { payload: { lng } }) {
            state.i18nextLng = lng
        },
    },
    extraReducers: bui => { },
})
