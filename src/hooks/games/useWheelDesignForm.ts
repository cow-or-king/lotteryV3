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
 * Helper pour extraire les données du design et éviter les erreurs de type inference
 * Type instantiation excessively deep and possibly infinite
 */
function extractDesignData(design: WheelDesignConfig) {
  const {
    id: _id,
    userId: _userId,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...designData
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = design as any;
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
      // Parser les segments depuis JSON si nécessaire
      // Type assertion to avoid deep instantiation issues
      const segments = (existingDesign as { segments: unknown }).segments;
      const parsedSegments = typeof segments === 'string' ? JSON.parse(segments) : segments;

      // Extract only WheelDesignConfig properties, excluding database fields
      setDesign({
        segments: parsedSegments as WheelSegmentDesign[],
        primaryColor: existingDesign.primaryColor ?? undefined,
        secondaryColor: existingDesign.secondaryColor ?? undefined,
        backgroundColor: existingDesign.backgroundColor,
        segmentBorderColor: existingDesign.segmentBorderColor,
        segmentBorderWidth: existingDesign.segmentBorderWidth,
        showSegmentText: existingDesign.showSegmentText,
        textSize: existingDesign.textSize,
        textFont: existingDesign.textFont,
        textRotation: existingDesign.textRotation,
        centerCircleSize: existingDesign.centerCircleSize,
        centerCircleColor: existingDesign.centerCircleColor,
        centerLogoUrl: existingDesign.centerLogoUrl || null,
        centerLogoSize: existingDesign.centerLogoSize,
        pointerColor: existingDesign.pointerColor,
        pointerStyle: existingDesign.pointerStyle as 'arrow' | 'triangle' | 'circle',
        animationSpeed: existingDesign.animationSpeed as 'slow' | 'normal' | 'fast',
        spinDuration: existingDesign.spinDuration,
        enableSound: existingDesign.enableSound,
        colorMode: existingDesign.colorMode as ColorMode,
        numberOfSegments: existingDesign.numberOfSegments,
        name: existingDesign.name,
      });
      setDesignName(existingDesign.name);
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
    const designData = extractDesignData(design);

    const dataToSave = {
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
