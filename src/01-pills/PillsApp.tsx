import React from "react";
import { examplePills } from "./data";
import { Pills } from "./Pills";
import { Instructions } from "./Instructions";

interface SetHeaderAction {
  type: "ToggleHeader";
  payload: string;
}

const reducer = (state: string[], action: SetHeaderAction): string[] => {
  if (action.type === "ToggleHeader") {
    if (state.includes(action.payload)) {
      return state.filter((x) => x !== action.payload);
    } else {
      return [...state, action.payload];
    }
  }
  return state;
};

export const PillsApp = () => {
  const [pills, setPills] = React.useState(examplePills);

  const [headers, dispatch] = React.useReducer(reducer, []);
  const toggleHeader = (id: string) => {
    dispatch({
      type: "ToggleHeader",
      payload: id,
    });
  };

  const shufflePills = () => {
    const newPills = [...pills];
    // shuffle the array
    newPills.sort(() => 0.5 - Math.random());
    setPills(newPills);
  };

  return (
    <>
      <Instructions />
      <button
        style={{
          marginBottom: "4px",
        }}
        onClick={shufflePills}
      >
        Shuffle pills
      </button>
      <hr />
      <div style={{ display: "flex" }}>
        <div style={{ width: "50%" }}>
          <h4>Regular</h4>
          <Pills pills={pills} headers={headers} toggleHeader={toggleHeader} />
        </div>
        <div style={{ width: "50%" }}>
          <h4>Bin packing (order not kept)</h4>
          <Pills
            pills={pills}
            headers={headers}
            toggleHeader={toggleHeader}
            binPacking
          />
        </div>
      </div>
    </>
  );
};
