import Components from "./components/Components";
import logo from "./assets/logo.png"
import City from "./city/City";
import { Tab, Tabs } from "luv-ui";


export default function App() {
    return (
        <div className="App d-flex flex-col gap p-24">
            <img src={logo} className="w-240" alt="Luv Logo" />
            <div className="card">
                <p className="text-text">Welcome to <strong className="text-theme">luv-ui</strong>, a modern UI component and style library for the game Luvia!</p>
            </div>
            <Tabs>
                <Tab title="Components">
                    <Components></Components>
                </Tab>

                <Tab title="City">
                    <City></City>
                </Tab>
            </Tabs>
        </div>
    )
}