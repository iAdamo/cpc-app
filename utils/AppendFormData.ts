export default function appendFormData(
  formData: FormData,
  data: any,
  parentKey = ""
) {
  if (data === null || data === undefined) return;

  if (
    typeof data === "object" &&
    !(data instanceof File) &&
    !(data instanceof Blob)
  ) {
    // Special handling for subcategories
    if (parentKey === "subcategories" && Array.isArray(data)) {
      data.forEach((item: { categoryId: string; _id: string }) => {
        formData.append("subcategories[]", item._id);
        formData.append("categories[]", item.categoryId);
      });
      return;
    }
    // Arrays
    if (Array.isArray(data)) {
      data.forEach((value, idx) => {
        appendFormData(formData, value, `${parentKey}[${idx}]`);
      });
    } else {
      // Objects
      Object.entries(data).forEach(([key, value]) => {
        const formKey = parentKey ? `${parentKey}[${key}]` : key;
        appendFormData(formData, value, formKey);
      });
    }
  } else {
    // Primitives, File, Blob
    let valueToAppend = data;
    if (typeof data === "boolean") valueToAppend = String(data);
    if (data !== "") formData.append(parentKey, valueToAppend);
  }
}
