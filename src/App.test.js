import { Provider } from "react-redux";
import { store } from "./app/store";
import SafeBoxContainer from "./components/safe-box-container/SafeBoxContainer";
import "./setupTests";
import { backlitTimeout, inputDelayTimeout, validationTimeout } from "./utils";

const { render, cleanup, fireEvent } = require("@testing-library/react");

afterEach(cleanup);
jest.setTimeout(100000);

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

function renderWithRedux(component, { store }) {
  return {
    ...render(<Provider store={store}>{component}</Provider>),
  };
}

test("it renders with redux", () => {
  const { getByTestId } = renderWithRedux(<SafeBoxContainer />, { store });
  expect(getByTestId("top-of-screen")).toHaveTextContent(/unlocked/i);
  expect(getByTestId("bottom-of-screen")).toHaveTextContent(/ready/i);
});

test("should display keys on click and auto lock with input delay", async () => {
  const { getByTestId } = renderWithRedux(<SafeBoxContainer />, { store });

  fireEvent.click(getByTestId("padKey-1"));
  fireEvent.click(getByTestId("padKey-2"));
  fireEvent.click(getByTestId("padKey-3"));
  fireEvent.click(getByTestId("padKey-4"));
  fireEvent.click(getByTestId("padKey-5"));
  fireEvent.click(getByTestId("padKey-6"));

  expect(getByTestId("bottom-of-screen")).toHaveTextContent(/123456/i);
  await sleep(inputDelayTimeout);

  expect(getByTestId("bottom-of-screen")).toHaveTextContent(/locking/i);
  await sleep(validationTimeout);

  expect(getByTestId("top-of-screen")).toHaveTextContent(/locked/i);
  expect(getByTestId("bottom-of-screen")).toHaveTextContent(/ready/i);
});

test("should display keys on click and lock with L", async () => {
  const { getByTestId } = renderWithRedux(<SafeBoxContainer />, { store });

  fireEvent.click(getByTestId("padKey-1"));
  fireEvent.click(getByTestId("padKey-2"));
  fireEvent.click(getByTestId("padKey-3"));
  fireEvent.click(getByTestId("padKey-4"));
  fireEvent.click(getByTestId("padKey-5"));
  fireEvent.click(getByTestId("padKey-6"));
  fireEvent.click(getByTestId("padKey-L"));

  expect(getByTestId("bottom-of-screen")).toHaveTextContent(/locking/i);

  await sleep(validationTimeout);

  expect(getByTestId("top-of-screen")).toHaveTextContent(/locked/i);
  expect(getByTestId("bottom-of-screen")).toHaveTextContent(/ready/i);
});

test("should not unlock with wrong code", async () => {
  const { getByTestId } = renderWithRedux(<SafeBoxContainer />, { store });

  fireEvent.click(getByTestId("padKey-1"));
  fireEvent.click(getByTestId("padKey-2"));
  fireEvent.click(getByTestId("padKey-3"));
  fireEvent.click(getByTestId("padKey-4"));
  fireEvent.click(getByTestId("padKey-5"));
  fireEvent.click(getByTestId("padKey-6"));
  fireEvent.click(getByTestId("padKey-L"));

  expect(getByTestId("bottom-of-screen")).toHaveTextContent(/locking/i);
  await sleep(validationTimeout);

  expect(getByTestId("top-of-screen")).toHaveTextContent(/locked/i);
  expect(getByTestId("bottom-of-screen")).toHaveTextContent(/ready/i);

  // unlocking
  fireEvent.click(getByTestId("padKey-2"));
  fireEvent.click(getByTestId("padKey-2"));
  fireEvent.click(getByTestId("padKey-4"));
  fireEvent.click(getByTestId("padKey-4"));
  fireEvent.click(getByTestId("padKey-4"));
  fireEvent.click(getByTestId("padKey-5"));

  expect(getByTestId("bottom-of-screen")).toHaveTextContent(/224445/i);
  await sleep(inputDelayTimeout);

  expect(getByTestId("bottom-of-screen")).toHaveTextContent(/unlocking/i);
  await sleep(validationTimeout);

  expect(getByTestId("top-of-screen")).toHaveTextContent(/locked/i);
  expect(getByTestId("bottom-of-screen")).toHaveTextContent(/error/i);
});

test("should check screen goes off after 5 seconds", async () => {
  const { getByTestId } = renderWithRedux(<SafeBoxContainer />, { store });

  expect(getByTestId("screen")).toHaveClass("safebox--screen safebox--screen--idle");
  fireEvent.click(getByTestId("padKey-1"));
  expect(getByTestId("screen")).not.toHaveClass("safebox--screen safebox--screen--idle");
  fireEvent.click(getByTestId("padKey-2"));

  expect(getByTestId("screen")).not.toHaveClass("safebox--screen safebox--screen--idle");

  await sleep(backlitTimeout);
  expect(getByTestId("screen")).toHaveClass("safebox--screen safebox--screen--idle");
});
