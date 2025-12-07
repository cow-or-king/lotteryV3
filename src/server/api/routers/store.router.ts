/**
 * Store Router
 * Routes tRPC pour la gestion des commerces
 * IMPORTANT: ZERO any types
 * Utilise le nouveau modèle Brand pour les enseignes
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { prisma } from '@/infrastructure/database/prisma-client';
import { TRPCError } from '@trpc/server';

export const storeRouter = createTRPCRouter({
  /**
   * Récupère les limites du plan utilisateur
   */
  getLimits: protectedProcedure.query(async ({ ctx }) => {
    // Récupérer la subscription
    const subscription = await prisma.subscription.findUnique({
      where: {
        userId: ctx.user.id,
      },
    });

    const plan = subscription?.plan || 'FREE';

    // Compter les brands et stores existants
    const [brandsCount, storesCount] = await Promise.all([
      prisma.brand.count({
        where: {
          ownerId: ctx.user.id,
        },
      }),
      prisma.store.count({
        where: {
          brand: {
            ownerId: ctx.user.id,
          },
        },
      }),
    ]);

    // Définir les limites selon le plan
    const limits = {
      FREE: {
        maxBrands: 1,
        maxStoresPerBrand: 1,
      },
      STARTER: {
        maxBrands: 3,
        maxStoresPerBrand: 10,
      },
      PRO: {
        maxBrands: 999,
        maxStoresPerBrand: 999,
      },
    };

    const currentLimits = limits[plan as keyof typeof limits] || limits.FREE;

    return {
      plan,
      brandsCount,
      storesCount,
      maxBrands: currentLimits.maxBrands,
      maxStoresPerBrand: currentLimits.maxStoresPerBrand,
      canCreateBrand: brandsCount < currentLimits.maxBrands,
      canCreateStore: storesCount < brandsCount * currentLimits.maxStoresPerBrand,
    };
  }),

  /**
   * Liste tous les stores de l'utilisateur connecté (via Brand)
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    // Récupérer les brands de l'utilisateur avec leurs stores
    const brands = await prisma.brand.findMany({
      where: {
        ownerId: ctx.user.id,
      },
      include: {
        stores: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            _count: {
              select: {
                campaigns: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Aplatir les stores avec les infos de brand
    const stores = brands.flatMap((brand) =>
      brand.stores.map((store) => ({
        id: store.id,
        name: store.name,
        slug: store.slug,
        description: store.description,
        googleBusinessUrl: store.googleBusinessUrl,
        isActive: store.isActive,
        isPaid: store.isPaid,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
        // Infos du brand
        brandId: brand.id,
        brandName: brand.name,
        logoUrl: brand.logoUrl,
        primaryColor: brand.primaryColor,
        secondaryColor: brand.secondaryColor,
        font: brand.font,
        // Count
        _count: store._count,
      })),
    );

    return stores;
  }),

  /**
   * Récupère un store par son ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const store = await prisma.store.findFirst({
        where: {
          id: input.id,
          brand: {
            ownerId: ctx.user.id, // Sécurité via Brand
          },
        },
        include: {
          brand: true,
          campaigns: {
            orderBy: {
              createdAt: 'desc',
            },
          },
          _count: {
            select: {
              campaigns: true,
            },
          },
        },
      });

      if (!store) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Commerce non trouvé',
        });
      }

      return store;
    }),

  /**
   * Crée un nouveau store
   * Workflow:
   * 1. Si brandId fourni: utiliser ce brand existant
   * 2. Sinon: créer un nouveau brand avec brandName + logoUrl
   */
  create: protectedProcedure
    .input(
      z.object({
        // Option 1: Utiliser un brand existant
        brandId: z.string().optional(),
        // Option 2: Créer un nouveau brand
        brandName: z
          .string()
          .min(2, "Le nom de l'enseigne doit contenir au moins 2 caractères")
          .optional(),
        logoUrl: z.string().url('URL du logo invalide').optional(),
        // Infos du commerce (toujours requis)
        name: z.string().min(2, 'Le nom du commerce doit contenir au moins 2 caractères'),
        googleBusinessUrl: z.string().url('URL Google Business invalide'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let brandId: string;

      // Cas 1: Brand existant fourni
      if (input.brandId) {
        // Vérifier que le brand appartient à l'utilisateur
        const brand = await prisma.brand.findFirst({
          where: {
            id: input.brandId,
            ownerId: ctx.user.id,
          },
        });

        if (!brand) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Enseigne non trouvée',
          });
        }

        brandId = brand.id;
      }
      // Cas 2: Créer un nouveau brand
      else if (input.brandName && input.logoUrl) {
        // Compter les brands existants
        const brandsCount = await prisma.brand.count({
          where: {
            ownerId: ctx.user.id,
          },
        });

        // DÉSACTIVÉ TEMPORAIREMENT POUR TESTS
        // Vérifier la limite de brands (1 gratuit pour FREE plan)
        // const subscription = await prisma.subscription.findUnique({
        //   where: {
        //     userId: ctx.user.id,
        //   },
        // });

        // Plan FREE: 1 seul brand gratuit
        // if (subscription?.plan === 'FREE' && brandsCount >= 1) {
        //   throw new TRPCError({
        //     code: 'FORBIDDEN',
        //     message: 'Limite d\'enseignes atteinte (1 max en version gratuite). Passez à un plan payant pour créer plusieurs enseignes.',
        //   });
        // }

        // Créer le nouveau brand
        const newBrand = await prisma.brand.create({
          data: {
            name: input.brandName,
            logoUrl: input.logoUrl,
            ownerId: ctx.user.id,
            isPaid: brandsCount > 0, // Le 2ème brand et suivants sont payants
          },
        });

        brandId = newBrand.id;
      }
      // Erreur: ni brandId ni brandName+logoUrl
      else {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Vous devez soit sélectionner une enseigne existante (brandId), soit créer une nouvelle enseigne (brandName + logoUrl)',
        });
      }

      // DÉSACTIVÉ TEMPORAIREMENT POUR TESTS
      // Vérifier la limite de stores pour ce brand
      const storesCount = await prisma.store.count({
        where: {
          brandId,
        },
      });

      // const subscription = await prisma.subscription.findUnique({
      //   where: {
      //     userId: ctx.user.id,
      //   },
      // });

      // Plan FREE: 1 seul commerce gratuit
      // if (subscription?.plan === 'FREE' && storesCount >= 1) {
      //   throw new TRPCError({
      //     code: 'FORBIDDEN',
      //     message: 'Limite de commerces atteinte (1 max en version gratuite). Passez à un plan payant pour ajouter d\'autres commerces.',
      //   });
      // }

      // Récupérer le brand pour générer le slug
      const brand = await prisma.brand.findUnique({
        where: { id: brandId },
      });

      if (!brand) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "Erreur lors de la récupération de l'enseigne",
        });
      }

      // Générer un slug unique depuis brandName + name
      const combinedName = `${brand.name} ${input.name}`;
      const baseSlug = combinedName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      let slug = baseSlug;
      let counter = 1;

      // Vérifier si le slug existe déjà
      while (await prisma.store.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Créer le store
      const store = await prisma.store.create({
        data: {
          name: input.name,
          slug,
          googleBusinessUrl: input.googleBusinessUrl,
          brandId,
          isPaid: storesCount > 0, // Le 2ème commerce et suivants sont payants
        },
        include: {
          brand: true,
        },
      });

      return store;
    }),

  /**
   * Met à jour un store
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        googleBusinessUrl: z.string().url().optional(),
        googlePlaceId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Vérifier que le store appartient à l'utilisateur (via Brand)
      const existingStore = await prisma.store.findFirst({
        where: {
          id: input.id,
          brand: {
            ownerId: ctx.user.id,
          },
        },
      });

      if (!existingStore) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Commerce non trouvé',
        });
      }

      const { id, ...data } = input;

      const store = await prisma.store.update({
        where: { id },
        data: {
          ...data,
          googlePlaceId: data.googlePlaceId || null,
        },
        include: {
          brand: true,
        },
      });

      return store;
    }),

  /**
   * Supprime un store
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Vérifier que le store appartient à l'utilisateur (via Brand)
      const store = await prisma.store.findFirst({
        where: {
          id: input.id,
          brand: {
            ownerId: ctx.user.id,
          },
        },
      });

      if (!store) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Commerce non trouvé',
        });
      }

      await prisma.store.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
