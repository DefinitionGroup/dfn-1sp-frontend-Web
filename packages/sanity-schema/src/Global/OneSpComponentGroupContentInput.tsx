import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Dialog,
  Flex,
  Select,
  Spinner,
  Stack,
  Text,
  useToast,
} from "@sanity/ui";
import {
  type ArrayOfObjectsInputProps,
  PatchEvent,
  set,
  useClient,
  useFormValue,
} from "sanity";
import { ArrowLineDown, Copy, X } from "@phosphor-icons/react";
import {
  collectImportCandidates,
  copyBlocksForImport,
  type ImportCandidate,
  type PageBuilderBlock,
} from "./oneSpComponentGroupImport";

type PageSummary = {
  _id: string;
  title?: string;
  channel?: string;
  slug?: string;
  componentCount?: number;
};

const MAX_COMPONENTS = 30;
const STUDIO_API_VERSION = "2025-09-16";

const PAGE_LIST_QUERY = `*[
  _type == "page" &&
  channel == "1spWeb" &&
  language == $language
] | order(title asc) {
  _id,
  title,
  channel,
  "slug": slug.current,
  "componentCount": count(content[defined(_type)])
}`;

const PAGE_CONTENT_QUERY = `*[
  _type == "page" &&
  _id == $pageId
][0]{
  content[]{...}
}`;

function createArrayKey(): string {
  return crypto.randomUUID().replaceAll("-", "").slice(0, 16);
}

function humanizeComponentType(componentType?: string): string {
  if (!componentType) return "Unknown component";

  return componentType
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (character) => character.toUpperCase());
}

function getComponentDetail(block: PageBuilderBlock): string | undefined {
  const candidates = [
    block.title,
    block.headline,
    block.heading,
    block.sectionTitle,
    block.description,
  ];

  const text = candidates.find(
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.trim().length > 0,
  );

  if (!text) return undefined;
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > 100 ? `${normalized.slice(0, 97)}...` : normalized;
}

function normalizePageId(pageId: string): string {
  return pageId.replace(/^drafts\./, "");
}

export function OneSpComponentGroupContentInput(
  props: ArrayOfObjectsInputProps,
) {
  const { onChange, value = [] } = props;
  const client = useClient({ apiVersion: STUDIO_API_VERSION });
  const toast = useToast();
  const languageValue = useFormValue(["language"]);
  const language = typeof languageValue === "string" ? languageValue : "en";

  const [isOpen, setIsOpen] = useState(false);
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [sourcePageId, setSourcePageId] = useState("");
  const [candidates, setCandidates] = useState<ImportCandidate[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [unsupportedCount, setUnsupportedCount] = useState(0);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [isLoadingComponents, setIsLoadingComponents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setIsLoadingPages(true);
    setError(null);

    client
      .fetch<PageSummary[]>(
        PAGE_LIST_QUERY,
        { language },
        { perspective: "previewDrafts" },
      )
      .then((result) => {
        if (cancelled) return;
        setPages(result);
      })
      .catch((fetchError: unknown) => {
        if (cancelled) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Could not load 1SP pages.",
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPages(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, isOpen, language]);

  useEffect(() => {
    if (!isOpen || !sourcePageId) {
      setCandidates([]);
      setSelectedKeys([]);
      setUnsupportedCount(0);
      return;
    }

    let cancelled = false;
    setIsLoadingComponents(true);
    setError(null);

    client
      .fetch<{ content?: PageBuilderBlock[] } | null>(
        PAGE_CONTENT_QUERY,
        { pageId: normalizePageId(sourcePageId) },
        { perspective: "previewDrafts" },
      )
      .then((page) => {
        if (cancelled) return;

        const sourceBlocks = Array.isArray(page?.content) ? page.content : [];
        const importable = collectImportCandidates(sourceBlocks);

        setCandidates(importable.candidates);
        setSelectedKeys(
          importable.candidates.map((candidate) => candidate.selectionKey),
        );
        setUnsupportedCount(importable.unsupportedCount);
      })
      .catch((fetchError: unknown) => {
        if (cancelled) return;
        setCandidates([]);
        setSelectedKeys([]);
        setUnsupportedCount(0);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Could not load the source page components.",
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoadingComponents(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, isOpen, sourcePageId]);

  function closeDialog() {
    setIsOpen(false);
    setSourcePageId("");
    setCandidates([]);
    setSelectedKeys([]);
    setUnsupportedCount(0);
    setError(null);
  }

  function toggleCandidate(selectionKey: string) {
    setSelectedKeys((current) =>
      current.includes(selectionKey)
        ? current.filter((key) => key !== selectionKey)
        : [...current, selectionKey],
    );
  }

  function toggleAll() {
    setSelectedKeys((current) =>
      current.length === candidates.length
        ? []
        : candidates.map((candidate) => candidate.selectionKey),
    );
  }

  function importSelectedComponents() {
    const selectedBlocks = copyBlocksForImport(
      candidates
        .filter((candidate) => selectedKeys.includes(candidate.selectionKey))
        .map((candidate) => candidate.block),
      createArrayKey,
    );

    if (selectedBlocks.length === 0) {
      setError("Select at least one component to import.");
      return;
    }

    if (value.length + selectedBlocks.length > MAX_COMPONENTS) {
      setError(
        `This group can contain at most ${MAX_COMPONENTS} components. Remove components or import a smaller selection.`,
      );
      return;
    }

    onChange(PatchEvent.from(set([...value, ...selectedBlocks])));
    toast.push({
      status: "success",
      title: `${selectedBlocks.length} component${selectedBlocks.length === 1 ? "" : "s"} imported`,
      description: "The imported copies can now be edited in this group.",
    });
    closeDialog();
  }

  const selectedPage = pages.find((page) => page._id === sourcePageId);

  return (
    <Stack space={3}>
      <Card padding={3} radius={2} border tone="primary">
        <Flex align="center" justify="space-between" gap={3} wrap="wrap">
          <Stack space={2}>
            <Text weight="semibold">Import editable components</Text>
            <Text size={1} muted>
              Copy selected components from another {language.toUpperCase()} 1SP
              page into this reusable group.
            </Text>
          </Stack>
          <Button
            type="button"
            icon={ArrowLineDown}
            text="Import from page"
            tone="primary"
            onClick={() => setIsOpen(true)}
          />
        </Flex>
      </Card>

      {props.renderDefault(props)}

      {isOpen ? (
        <Dialog
          id="one-sp-component-group-import"
          header="Import components from a 1SP page"
          width={2}
          onClose={closeDialog}
          footer={
            <Flex justify="flex-end" gap={2} padding={3}>
              <Button
                type="button"
                mode="bleed"
                icon={X}
                text="Cancel"
                onClick={closeDialog}
              />
              <Button
                type="button"
                icon={Copy}
                text={`Import selected (${selectedKeys.length})`}
                tone="primary"
                disabled={selectedKeys.length === 0 || isLoadingComponents}
                onClick={importSelectedComponents}
              />
            </Flex>
          }
        >
          <Box padding={4}>
            <Stack space={4}>
              <Stack space={2}>
                <Text size={1} weight="semibold">
                  Source page
                </Text>
                {isLoadingPages ? (
                  <Flex align="center" gap={2} padding={3}>
                    <Spinner muted />
                    <Text size={1} muted>
                      Loading 1SP pages...
                    </Text>
                  </Flex>
                ) : (
                  <Select
                    value={sourcePageId}
                    padding={3}
                    onChange={(event) => setSourcePageId(event.currentTarget.value)}
                  >
                    <option value="">Select a page...</option>
                    {pages.map((page) => (
                      <option key={page._id} value={page._id}>
                        {page.title || page.slug || "Untitled page"} ({
                          page.componentCount || 0
                        } components)
                      </option>
                    ))}
                  </Select>
                )}
              </Stack>

              {error ? (
                <Card padding={3} radius={2} tone="critical">
                  <Text size={1}>{error}</Text>
                </Card>
              ) : null}

              {isLoadingComponents ? (
                <Flex align="center" gap={2} padding={4} justify="center">
                  <Spinner muted />
                  <Text size={1} muted>
                    Loading page components...
                  </Text>
                </Flex>
              ) : null}

              {!isLoadingComponents && sourcePageId ? (
                <Stack space={3}>
                  <Flex align="center" justify="space-between" gap={3}>
                    <Stack space={1}>
                      <Text weight="semibold">
                        {selectedPage?.title || "Page components"}
                      </Text>
                      <Text size={1} muted>
                        {candidates.length} supported component{
                          candidates.length === 1 ? "" : "s"
                        }
                        {unsupportedCount > 0
                          ? ` • ${unsupportedCount} unsupported item${unsupportedCount === 1 ? "" : "s"} omitted`
                          : ""}
                      </Text>
                    </Stack>
                    {candidates.length > 0 ? (
                      <Button
                        type="button"
                        mode="bleed"
                        text={
                          selectedKeys.length === candidates.length
                            ? "Clear all"
                            : "Select all"
                        }
                        onClick={toggleAll}
                      />
                    ) : null}
                  </Flex>

                  {candidates.length === 0 ? (
                    <Card padding={4} radius={2} border>
                      <Text muted>
                        This page has no supported 1SP components to import.
                      </Text>
                    </Card>
                  ) : (
                    <Stack space={2}>
                      {candidates.map((candidate, index) => {
                        const isSelected = selectedKeys.includes(
                          candidate.selectionKey,
                        );
                        const detail = getComponentDetail(candidate.block);

                        return (
                          <Card
                            as="label"
                            key={candidate.selectionKey}
                            padding={3}
                            radius={2}
                            border
                            tone={isSelected ? "primary" : "default"}
                            style={{ cursor: "pointer" }}
                          >
                            <Flex align="flex-start" gap={3}>
                              <Checkbox
                                checked={isSelected}
                                onChange={() =>
                                  toggleCandidate(candidate.selectionKey)
                                }
                              />
                              <Stack space={2} flex={1}>
                                <Text weight="semibold">
                                  {index + 1}. {humanizeComponentType(
                                    candidate.block._type,
                                  )}
                                </Text>
                                {detail ? (
                                  <Text size={1} muted>
                                    {detail}
                                  </Text>
                                ) : null}
                              </Stack>
                            </Flex>
                          </Card>
                        );
                      })}
                    </Stack>
                  )}
                </Stack>
              ) : null}
            </Stack>
          </Box>
        </Dialog>
      ) : null}
    </Stack>
  );
}
