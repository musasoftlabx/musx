export const formatTrackTime = (secs: number) => {
  secs = Math.round(secs);
  let minutes = Math.floor(secs / 60) || 0;
  let seconds = secs - minutes * 60 || 0;
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
};

export const arrayMove = (
  fromIndex: number,
  toIndex: number,
  palette: string[],
) => {
  let element = palette[fromIndex];
  palette.splice(fromIndex, 1);
  palette.splice(toIndex, 0, element);
};
