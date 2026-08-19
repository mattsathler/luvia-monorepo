import { describe, expect, it, vi } from "vitest";

const renderMock = vi.fn();
const createRootMock = vi.fn(() => ({ render: renderMock }));

vi.mock("react-dom/client", () => ({
    createRoot: createRootMock,
}));

describe("main", () => {
    it("mounts the App into the #root element", async () => {
        document.body.innerHTML = '<div id="root"></div>';

        await import("./main");

        expect(createRootMock).toHaveBeenCalledWith(document.getElementById("root"));
        expect(renderMock).toHaveBeenCalledTimes(1);
    });
});
