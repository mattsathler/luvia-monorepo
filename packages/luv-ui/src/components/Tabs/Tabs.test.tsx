import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "./Tabs";
import { Tab } from "./Tab";

describe("Tabs", () => {
    it("renders the first tab active by default and switches on click", async () => {
        render(
            <Tabs>
                <Tab title="First">First content</Tab>
                <Tab title="Second">Second content</Tab>
            </Tabs>
        );

        expect(screen.getByText("First content")).toBeInTheDocument();
        expect(screen.queryByText("Second content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: "Second" }));

        expect(screen.getByText("Second content")).toBeInTheDocument();
        expect(screen.queryByText("First content")).not.toBeInTheDocument();
    });
});
