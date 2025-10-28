type Period = "hoje" | "7d" | "30d" | "total";

export const getDateRangeForPeriod = (period: Period): { start: Date; end: Date } => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  let start = new Date();
  
  switch (period) {
    case "hoje":
      start.setHours(0, 0, 0, 0);
      break;
    case "7d":
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case "30d":
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      break;
    case "total":
      start = new Date(0); // Beginning of time
      break;
  }
  
  return { start, end };
};

export const isDateInRange = (dateString: string, start: Date, end: Date): boolean => {
  const date = new Date(dateString);
  return date >= start && date <= end;
};
