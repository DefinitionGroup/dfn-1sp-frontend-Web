import React, { useCallback, useEffect, useMemo } from "react";
import {
  ArrayOfObjectsInputProps,
  set,
  unset,
  PatchEvent,
  useFormValue,
} from "sanity";

// Custom input component for bidirectional references between Services and ServiceGroups
export function BidirectionalServiceGroupInput(
  props: ArrayOfObjectsInputProps
) {
  const { onChange, value = [], schemaType } = props;
  const document = useFormValue([]);

  // Handle changes to the reference array
  const handleChange = useCallback(
    (patchEvent: PatchEvent) => {
      onChange(patchEvent);

      // Note: The actual bidirectional sync will happen via document actions
      // This component just provides the UI for managing references
    },
    [onChange]
  );

  // Use the default array input behavior
  return props.renderDefault(props);
}

// Custom input component for services in service groups
export function BidirectionalServicesInput(props: ArrayOfObjectsInputProps) {
  const { onChange, value = [], schemaType } = props;
  const document = useFormValue([]);

  // Handle changes to the reference array
  const handleChange = useCallback(
    (patchEvent: PatchEvent) => {
      onChange(patchEvent);

      // Note: The actual bidirectional sync will happen via document actions
      // This component just provides the UI for managing references
    },
    [onChange]
  );

  // Use the default array input behavior
  return props.renderDefault(props);
}
