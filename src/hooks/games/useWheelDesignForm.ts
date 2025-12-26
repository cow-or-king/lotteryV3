/**
 * Hook pour gérer le formulaire de design de roue
 * Centralise toute la logique de state et mutations
 * IMPORTANT: ZERO any types
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/trpc/client';
import { toast } from 'sonner';
import {
  WheelDesignConfig,
  ColorMode,
  ColorModeEnum,
  getDefaultWheelDesign,
  generateSegments,
  generateRandomBiColors,
  WheelSegmentDesign,
} from '@/lib/types/game';

/**
 * Type for wheel design data without database fields (id, userId, createdAt, updatedAt)
 */
type WheelDesignData = Omit<
  WheelDesignConfig,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isDefault'
>;

/**
 * Helper pour extraire les données du design et éviter les erreurs de type inference
 * Type instantiation excessively deep and possibly infinite
 */
function extractDesignData(design: WheelDesignConfig): WheelDesignData {
  const {
    id: _id,
    userId: _userId,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    isDefault: _isDefault,
    ...designData
  } = design;
  return designData;
}

export function useWheelDesignForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const designId = searchParams.get('id');
  const utils = api.useUtils();

  // State
  const [design, setDesign] = useState<WheelDesignConfig>(getDefaultWheelDesign());
  const [designName, setDesignName] = useState('Ma roue personnalisée');

  // Charger le design existant
  const { data: existingDesign, isLoading } = api.wheelDesign.getById.useQuery(designId || '', {
    enabled: !!designId,
  });

  useEffect(() => {
    if (existingDesign) {
      // Cast to Record to avoid TRPC deep instantiation type issues
      type DbDesignRecord = Record<string, string | number | boolean | null | object>;
      const designRecord = existingDesign as unknown as DbDesignRecord;

      // Parser les segments depuis JSON si nécessaire
      const rawSegments = designRecord.segments as string | WheelSegmentDesign[] | object;
      const parsedSegments: WheelSegmentDesign[] =
        typeof rawSegments === 'string'
          ? (JSON.parse(rawSegments) as WheelSegmentDesign[])
          : (rawSegments as WheelSegmentDesign[]);

      // Extract only WheelDesignConfig properties, excluding database fields
      setDesign({
        segments: parsedSegments,
        primaryColor: (designRecord.primaryColor as string | null) ?? undefined,
        secondaryColor: (designRecord.secondaryColor as string | null) ?? undefined,
        backgroundColor: designRecord.backgroundColor as string,
        segmentBorderColor: designRecord.segmentBorderColor as string,
        segmentBorderWidth: designRecord.segmentBorderWidth as number,
        showSegmentText: designRecord.showSegmentText as boolean,
        textSize: designRecord.textSize as number,
        textFont: designRecord.textFont as string,
        textRotation: designRecord.textRotation as number,
        centerCircleSize: designRecord.centerCircleSize as number,
        centerCircleColor: designRecord.centerCircleColor as string,
        centerLogoUrl: (designRecord.centerLogoUrl as string | null) || null,
        centerLogoSize: designRecord.centerLogoSize as number,
        pointerColor: designRecord.pointerColor as string,
        pointerStyle: designRecord.pointerStyle as 'arrow' | 'triangle' | 'circle',
        animationSpeed: designRecord.animationSpeed as 'slow' | 'normal' | 'fast',
        spinDuration: designRecord.spinDuration as number,
        enableSound: designRecord.enableSound as boolean,
        colorMode: designRecord.colorMode as ColorMode,
        numberOfSegments: designRecord.numberOfSegments as number,
        name: designRecord.name as string,
      });
      setDesignName(designRecord.name as string);
    }
  }, [existingDesign]);

  // Mutations - Extract options to avoid type instantiation depth issues
  type MutationOptions = {
    onSuccess: () => void;
    onError: (error: unknown) => void;
  };

  const createDesignOptions: MutationOptions = {
    onSuccess: () => {
      void utils.wheelDesign.list.invalidate();
      toast.success('Design créé avec succès');
      router.push('/dashboard/games');
    },
    onError: (_error) => {
      toast.error('Erreur lors de la création du design');
    },
  };

  const updateDesignOptions: MutationOptions = {
    onSuccess: () => {
      void utils.wheelDesign.list.invalidate();
      void utils.wheelDesign.getById.invalidate();
      toast.success('Design mis à jour avec succès');
      router.push('/dashboard/games');
    },
    onError: (_error) => {
      toast.error('Erreur lors de la mise à jour du design');
    },
  };

  const createDesign = api.wheelDesign.create.useMutation(createDesignOptions);
  const updateDesign = api.wheelDesign.update.useMutation(updateDesignOptions);

  // Handlers
  const handleSaveDesign = () => {
    const designData: WheelDesignData = extractDesignData(design);

    const dataToSave: WheelDesignData = {
      ...designData,
      name: designName,
    };

    if (designId) {
      updateDesign.mutate({ id: designId, data: dataToSave });
    } else {
      createDesign.mutate(dataToSave);
    }
  };

  const handleColorModeChange = (mode: ColorMode) => {
    let primaryColor = design.primaryColor || '#8B5CF6';
    let secondaryColor = design.secondaryColor || '#EC4899';

    if (mode === ColorModeEnum.BI_COLOR) {
      const randomColors = generateRandomBiColors();
      primaryColor = randomColors.primary;
      secondaryColor = randomColors.secondary;
    }

    const newSegments = generateSegments(
      design.numberOfSegments,
      mode,
      primaryColor,
      secondaryColor,
    );

    setDesign({
      ...design,
      colorMode: mode,
      primaryColor,
      secondaryColor,
      segments: newSegments,
    });
  };

  const handleNumberOfSegmentsChange = (count: number) => {
    const newSegments = generateSegments(
      count,
      design.colorMode,
      design.primaryColor || '#8B5CF6',
      design.secondaryColor || '#EC4899',
    );

    setDesign({
      ...design,
      numberOfSegments: count,
      segments: newSegments,
    });
  };

  const handlePrimaryColorChange = (color: string) => {
    if (design.colorMode === ColorModeEnum.BI_COLOR) {
      const newSegments = generateSegments(
        design.numberOfSegments,
        design.colorMode,
        color,
        design.secondaryColor || '#EC4899',
      );

      setDesign({
        ...design,
        primaryColor: color,
        segments: newSegments,
      });
    }
  };

  const handleSecondaryColorChange = (color: string) => {
    if (design.colorMode === ColorModeEnum.BI_COLOR) {
      const newSegments = generateSegments(
        design.numberOfSegments,
        design.colorMode,
        design.primaryColor || '#8B5CF6',
        color,
      );

      setDesign({
        ...design,
        secondaryColor: color,
        segments: newSegments,
      });
    }
  };

  const handleSegmentColorChange = (index: number, color: string) => {
    const newSegments = [...design.segments];
    if (newSegments[index]) {
      newSegments[index] = {
        ...newSegments[index],
        id: newSegments[index]?.id || `${index + 1}`,
        label: newSegments[index]?.label || `Gain ${index + 1}`,
        color,
      };
      setDesign({ ...design, segments: newSegments });
    }
  };

  return {
    // State
    design,
    setDesign,
    designName,
    setDesignName,
    designId,
    isLoading,
    isSaving: createDesign.isPending || updateDesign.isPending,

    // Handlers
    handleSaveDesign,
    handleColorModeChange,
    handleNumberOfSegmentsChange,
    handlePrimaryColorChange,
    handleSecondaryColorChange,
    handleSegmentColorChange,
  };
}
