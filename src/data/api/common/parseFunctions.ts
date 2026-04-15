
/// parse formData for body api
export const parseFormData = (data: any, keepFormData?: boolean): FormData => {
  const bodyFormData = new FormData()
  Object.keys(data).forEach((key: string) => {
    if (Array.isArray(data[key])) {
      data[key].forEach((value: any) => {
        bodyFormData.append(`${key}[]`, value)
      })
    } else {
      bodyFormData.append(key, data[key])
    }
  })
  return bodyFormData
}

export const parseFormDataAddress = (data: Record<string, any>): FormData => {
  const formData = new FormData();

  const buildFormData = (formData: FormData, data: any, parentKey?: string) => {
    if (data && typeof data === 'object' && !(data instanceof File)) {
      Object.keys(data).forEach((key) => {
        const fullKey = parentKey ? `${parentKey}[${key}]` : key;
        buildFormData(formData, data[key], fullKey);
      });
    } else {
      formData.append(parentKey!, data ?? '');
    }
  };

  buildFormData(formData, data);

  return formData;
};
