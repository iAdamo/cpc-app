export default function appendFormData(
  formData: FormData,
  data: any,
  parentKey = ""
) {
  if (data === null || data === undefined) return;

  // RN file object
  if (typeof data === "object" && data.uri && (data.type || data.name)) {
    formData.append(parentKey, {
      uri: data.uri,
      name: data.name,
      type: data.type,
    } as any);
    return;
  }

  // Subcategories special case
  if (parentKey === "subcategories" && Array.isArray(data)) {
    data.forEach((item: { categoryId: string; _id: string }) => {
      formData.append("subcategories[]", item._id);
      formData.append("categories[]", item.categoryId);
    });
    return;
  }

  // Arrays — append with same key, not [idx]
  if (Array.isArray(data)) {
    data.forEach((value) => {
      appendFormData(formData, value, parentKey);
    });
    return;
  }

  // Plain objects
  if (
    typeof data === "object" &&
    !(data instanceof File) &&
    !(data instanceof Blob)
  ) {
    Object.entries(data).forEach(([key, value]) => {
      const formKey = parentKey ? `${parentKey}[${key}]` : key;
      appendFormData(formData, value, formKey);
    });
    return;
  }

  // Primitives
  let valueToAppend = data;
  if (typeof data === "boolean") valueToAppend = String(data);
  if (parentKey && valueToAppend !== "")
    formData.append(parentKey, valueToAppend);
}
