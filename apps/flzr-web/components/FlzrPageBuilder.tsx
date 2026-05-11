import { PageBuilder } from "@/components/PageBuilder";
import type { Page } from "@/types/sanity.types";

type FlzrPageBuilderProps = {
  content: NonNullable<Page["content1sp"]>;
  language?: string;
  deferAfter?: number;
};

export default function FlzrPageBuilder({
  content,
  language = "en",
  deferAfter = 2,
}: FlzrPageBuilderProps) {
  return (
    <PageBuilder
      content={content}
      language={language}
      deferAfter={deferAfter}
    />
  );
}
