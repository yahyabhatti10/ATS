import { Outlet } from "react-router-dom";
import Navbar from "../custome/NavBar";

export default function  MainLayout(){
    return(
        <>
            <Navbar/>
            <Outlet/>
        </>
    )
}