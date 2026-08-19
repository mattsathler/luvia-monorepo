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

    it("renders no tabs and no crash when given no children", () => {
        const { container } = render(<Tabs />);

        expect(container.querySelectorAll("button")).toHaveLength(0);
    });

    it("activates the only tab by default when given a single child instead of an array", () => {
        render(
            <Tabs>
                <Tab title="Only">Only content</Tab>
            </Tabs>
        );

        expect(screen.getByText("Only content")).toBeInTheDocument();
    });

    it("renders an icon instead of the title, using the title as the aria-label", () => {
        render(
            <Tabs>
                <Tab title="Corpo" icon={<span data-testid="icon">🧍</span>}>
                    Corpo content
                </Tab>
                <Tab title="Rosto">Rosto content</Tab>
            </Tabs>
        );

        const button = screen.getByRole("button", { name: "Corpo" });
        expect(button).toContainElement(screen.getByTestId("icon"));
        expect(button).not.toHaveTextContent("Corpo");
    });
});
