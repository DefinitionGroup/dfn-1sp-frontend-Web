import type { ComponentProps } from "react";
import { getUnitLogoFloatUnits } from "@1sp/sanity-queries";
import PageBuilderPersonioJobs from "../pg-PageBuilderPersonioJobs";

type PersonioJobsBlockProps = Omit<ComponentProps<typeof PageBuilderPersonioJobs>, "units">;

/** Unit logos load with the page, so visitors' browsers never query Sanity. */
export default async function PersonioJobsBlock(props: PersonioJobsBlockProps) {
  // Logos only decorate the cards and feed the unit filter, so a failed
  // Sanity request must not hide the job list.
  const units = await getUnitLogoFloatUnits(props.language || "en", 200).catch(() => []);
  return <PageBuilderPersonioJobs {...props} units={units} />;
}
