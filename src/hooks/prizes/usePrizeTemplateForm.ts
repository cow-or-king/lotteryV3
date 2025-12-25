/**
 * Hook for managing prize template form state
 */
interface TemplateFormData {
  brandId: string;
  name: string;
  description: string;
  minPrice: string;
  maxPrice: string;
  color: string;
  iconUrl: string;
}

interface EditingTemplate {
  id: string;
  name: string;
  description: string;
  minPrice: number | null;
  maxPrice: number | null;
  color: string;
  iconUrl: string | null;
}

interface UsePrizeTemplateFormParams {
  isEditing: boolean;
  formData?: TemplateFormData;
  setFormData?: (data: TemplateFormData) => void;
  editingData?: EditingTemplate;
  setEditingData?: (data: EditingTemplate) => void;
}

export function usePrizeTemplateForm({
  isEditing,
  formData,
  setFormData,
  editingData,
  setEditingData,
}: UsePrizeTemplateFormParams) {
  const getName = () => (isEditing ? editingData?.name : formData?.name) ?? '';
  const getDescription = () => (isEditing ? editingData?.description : formData?.description) ?? '';
  const getColor = () => (isEditing ? editingData?.color : formData?.color) ?? '#8B5CF6';
  const getIconUrl = () => (isEditing ? editingData?.iconUrl : formData?.iconUrl) ?? '';

  const getMinPrice = () => {
    if (isEditing) {
      return editingData?.minPrice !== null && editingData?.minPrice !== undefined
        ? editingData.minPrice
        : '';
    }
    return formData?.minPrice ?? '';
  };

  const getMaxPrice = () => {
    if (isEditing) {
      return editingData?.maxPrice !== null && editingData?.maxPrice !== undefined
        ? editingData.maxPrice
        : '';
    }
    return formData?.maxPrice ?? '';
  };

  const updateName = (name: string) => {
    if (isEditing && editingData && setEditingData) {
      setEditingData({ ...editingData, name });
    } else if (formData && setFormData) {
      setFormData({ ...formData, name });
    }
  };

  const updateDescription = (description: string) => {
    if (isEditing && editingData && setEditingData) {
      setEditingData({ ...editingData, description });
    } else if (formData && setFormData) {
      setFormData({ ...formData, description });
    }
  };

  const updateMinPrice = (value: string) => {
    if (isEditing && editingData && setEditingData) {
      setEditingData({
        ...editingData,
        minPrice: value ? parseFloat(value) : null,
      });
    } else if (formData && setFormData) {
      setFormData({ ...formData, minPrice: value });
    }
  };

  const updateMaxPrice = (value: string) => {
    if (isEditing && editingData && setEditingData) {
      setEditingData({
        ...editingData,
        maxPrice: value ? parseFloat(value) : null,
      });
    } else if (formData && setFormData) {
      setFormData({ ...formData, maxPrice: value });
    }
  };

  const updateColor = (color: string) => {
    if (isEditing && editingData && setEditingData) {
      setEditingData({ ...editingData, color });
    } else if (formData && setFormData) {
      setFormData({ ...formData, color });
    }
  };

  const updateIconUrl = (iconUrl: string) => {
    if (isEditing && editingData && setEditingData) {
      setEditingData({ ...editingData, iconUrl });
    } else if (formData && setFormData) {
      setFormData({ ...formData, iconUrl });
    }
  };

  return {
    name: getName(),
    description: getDescription(),
    color: getColor(),
    iconUrl: getIconUrl(),
    minPrice: getMinPrice(),
    maxPrice: getMaxPrice(),
    updateName,
    updateDescription,
    updateMinPrice,
    updateMaxPrice,
    updateColor,
    updateIconUrl,
  };
}
