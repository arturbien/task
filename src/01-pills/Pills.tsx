import React, { useLayoutEffect, useRef } from "react";
import { PillData } from "./data";
import { Pill } from "./Pill";

interface PillsProps {
  pills: PillData[];
  headers: PillData["id"][]; // ids of pills that are toggled on
  toggleHeader: (id: string) => void;
  /**
   * When enabled, pills will be "bin packed".
   * **WARNING** Original order of pills will be lost.
   */
  binPacking?: boolean;
}

interface LayoutBreakElement {
  id: string;
  type: "line-break";
}

interface LayoutPillElement {
  id: string;
  type: "pill";
  pill: PillData;
}

type LayoutElement = LayoutBreakElement | LayoutPillElement;

export function Pills({
  pills,
  headers,
  toggleHeader,
  binPacking,
}: PillsProps) {
  const containerNode = React.useRef<HTMLDivElement>(null);
  const pillRefs = React.useRef<{ [id: PillData["id"]]: HTMLDivElement }>({});
  const testPillRef = useRef<HTMLDivElement>(null);
  const testHeaderPillRef = useRef<HTMLDivElement>(null);

  const [layoutElements, setLayoutElements] = React.useState<LayoutElement[]>(
    () => {
      return pills.map((pill) => ({
        id: pill.id,
        type: "pill",
        pill: pill,
      }));
    }
  );

  // useLayoutEffect is used to avoid the initial "flicker"
  // of layout shift when pills are rendered for the first time
  useLayoutEffect(() => {
    const testPill = testPillRef.current;
    const testHeaderPill = testHeaderPillRef.current;
    const container = containerNode.current;
    if (!testPill || !testHeaderPill || !container) return;

    // In both algorithms, the width of elements is measured with "getBoundingClientRect".
    // It's more accurate than using the "offsetWidth" property.

    const getPillMaxWidth = (pill: PillData) => {
      // When pill is already toggled on, it already has the max possible width.
      // Otherwise to get the max width, add the header icon width to the pill width.
      const headerIconWidth =
        testHeaderPill.getBoundingClientRect().width -
        testPill.getBoundingClientRect().width;
      const pillElement = pillRefs.current[pill.id];
      const maxWidth =
        pillElement.getBoundingClientRect().width +
        (headers.includes(pill.id) ? 0 : headerIconWidth);
      return maxWidth;
    };

    const getDefaultLayout = () => {
      const newLayout: LayoutElement[] = [];
      const containerWidth = container.getBoundingClientRect().width;

      let spaceLeft = containerWidth;
      let rowCount = 0;
      pills.forEach((pill) => {
        const pillMaxWidth = getPillMaxWidth(pill);

        if (pill) {
          if (spaceLeft - pillMaxWidth < 0) {
            newLayout.push({
              id: `${rowCount}-line-break`,
              type: "line-break",
            });
            rowCount += 1;
            spaceLeft = containerWidth;
          }
          newLayout.push({
            id: pill.id,
            type: "pill",
            pill,
          });
          spaceLeft = spaceLeft - pillMaxWidth;
        }
      });
      return newLayout;
    };

    const getBinPackedLayout = () => {
      const newLayout: {
        spaceLeft: number;
        elements: LayoutElement[];
      }[] = [];
      const containerWidth = container.getBoundingClientRect().width;

      const pillsBigToSmall = [...pills].sort((a, b) => {
        const aMaxWidth = getPillMaxWidth(a);
        const bMaxWidth = getPillMaxWidth(b);

        return bMaxWidth - aMaxWidth;
      });

      pillsBigToSmall.forEach((pill) => {
        const pillMaxWidth = getPillMaxWidth(pill);

        if (newLayout.length === 0) {
          newLayout.push({
            spaceLeft: containerWidth,
            elements: [],
          });
        }
        const rowWithSpaceForPill = newLayout.find(
          (row) => row.spaceLeft - pillMaxWidth >= 0
        );
        if (rowWithSpaceForPill) {
          rowWithSpaceForPill.elements.push({
            id: pill.id,
            type: "pill",
            pill,
          });
          rowWithSpaceForPill.spaceLeft =
            rowWithSpaceForPill.spaceLeft - pillMaxWidth;
        } else {
          newLayout.push({
            spaceLeft: containerWidth - pillMaxWidth,
            elements: [
              {
                id: pill.id,
                type: "pill",
                pill,
              },
            ],
          });
        }
      });
      const layout: LayoutElement[] = newLayout.flatMap((row, index) => [
        ...row.elements,
        {
          id: `${index}-line-break`,
          type: "line-break",
        },
      ]);
      // Remove the last line break
      return layout.slice(0, -1);
    };

    const getLayout = binPacking ? getBinPackedLayout : getDefaultLayout;
    setLayoutElements(getLayout);

    // TODO: debounce or throttle ResizeObserver callback.
    // Didn't want to add dependencies to the project so I left it at that.
    // RO is used instead of window.onresize in case the container changes
    // its width due to other layout changes (like opening a sidebar or similar).
    const resizeObserver = new ResizeObserver(() => {
      setLayoutElements(getLayout);
    });
    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
    };
  }, [pills, headers, binPacking]);

  const setPillRef = (id: PillData["id"], node: HTMLDivElement) => {
    pillRefs.current[id] = node;
  };

  return (
    <div>
      <div ref={containerNode}>
        {layoutElements.map((el) => {
          if (el.type === "line-break") {
            return <br key={el.id} />;
          } else {
            return (
              <Pill
                key={el.pill.id}
                header={headers.includes(el.pill.id)}
                onClick={() => {
                  toggleHeader(el.pill.id);
                }}
                ref={(element) => element && setPillRef(el.pill.id, element)}
              >
                {el.pill.value}
              </Pill>
            );
          }
        })}
      </div>
      {/* Hidden element that renders the pill in both states to measure the width 
       difference between two states (effectively getting the "header" icon width). */}
      <div
        style={{
          height: 0,
          width: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
        aria-hidden
      >
        <Pill header={false} ref={testPillRef}>
          Test
        </Pill>
        <Pill header ref={testHeaderPillRef}>
          Test
        </Pill>
      </div>
    </div>
  );
}
