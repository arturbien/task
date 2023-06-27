export enum FrameMessageType {
  FrameSizeChange = "Surfer_frameSizeChange",
}

export type FrameSizeChangeMessage = {
  type: FrameMessageType.FrameSizeChange;
  width: number;
  height: number;
};

export const frameSizeChangeMessage = ({
  width,
  height,
}: {
  width: number;
  height: number;
}): FrameSizeChangeMessage => ({
  type: FrameMessageType.FrameSizeChange,
  width,
  height,
});
