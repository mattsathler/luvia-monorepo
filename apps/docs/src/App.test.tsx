import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App", () => {
    it("renders the luv-ui storybook shell", () => {
        render(<App />);
        expect(screen.getByText(/luv-ui/i)).toBeInTheDocument();
    });

    it("renders the City tab's content when selected", async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(screen.getByRole("button", { name: "City" }));

        expect(screen.getByText("Grid & City Structure")).toBeInTheDocument();
    });
});
