import * as React from "react";

interface VirtualizedListProps {
  children: React.ReactNode[];
  listItemHeight?: number; // height of each item in pixels
  overscanCount?: number; // number of items to render above and below the visible area
}

// improves performance for large lists by only rendering visible items based on scroll position
export function VirtualizedList({
  children,
  // TODO: figure out a better way to handle variable height items
  listItemHeight = 29,
  overscanCount = 5,
}: VirtualizedListProps) {
  // get scroll position and height of container
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollTopRef = React.useRef(0);
  const [, forceRender] = React.useReducer((x) => x + 1, 0);
  const [containerHeight, setContainerHeight] = React.useState(400); // Start with reasonable fallback
  const rafIdRef = React.useRef<number | null>(null);

  // update scroll position and container height on scroll and resize
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return null;

    const onScroll = () => {
      // Update scroll position immediately for smooth scrolling
      scrollTopRef.current = container.scrollTop;

      // Debounce the re-render using requestAnimationFrame
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        forceRender(); // Trigger re-render with new scroll position
        rafIdRef.current = null;
      });
    };
    const onResize = () => setContainerHeight(container.clientHeight);

    container.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);
    onResize(); // initial height

    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      // Clean up any pending animation frame
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);

  // Re-measure container height when children change
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return null;

    const resizeObserver = new ResizeObserver(() => {
      setContainerHeight(container.clientHeight);
    });

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // determine page size and visible range
  const totalItems = children.length;
  const scrollTop = scrollTopRef.current;

  // Use fallback height to prevent 0 itemsPerPage which causes flashing
  const itemsPerPage = Math.ceil(containerHeight / listItemHeight);
  const visibleStartIndex = Math.floor(scrollTop / listItemHeight);
  const visibleEndIndex = visibleStartIndex + itemsPerPage;

  const startIndex = Math.max(0, visibleStartIndex - overscanCount);
  const endIndex = Math.min(totalItems, visibleEndIndex + overscanCount);

  // Prevent rendering when calculations would be invalid
  const shouldRender =
    containerHeight > 0 && totalItems > 0 && itemsPerPage > 0;

  // slice children to only render visible items
  const visibleChildren = shouldRender
    ? children.slice(startIndex, endIndex)
    : [];

  return (
    <div
      // container for the virtualized list; scroll and resize listeners attached here
      ref={containerRef}
      style={{
        height: "100%",
        overflowY: "auto",
        position: "relative",
        willChange: "transform",
      }}
    >
      <div
        // spacer to give the full height to the scrollable area
        style={{
          height: totalItems * listItemHeight,
          position: "relative",
        }}
      >
        {shouldRender && (
          <div
            // inner container to position the visible items
            style={{
              transform: `translateY(${startIndex * listItemHeight}px)`,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            {visibleChildren}
          </div>
        )}
      </div>
    </div>
  );
}
