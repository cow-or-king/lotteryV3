'use client';

import { Wifi, User, Facebook, Instagram, Mail, Phone, Globe } from 'lucide-react';
import { QRCodeStyle, QRCodeAnimation } from '@/lib/types/qr-code.types';

/**
 * QR Code Template Type
 */
export type QRCodeTemplate = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  style: QRCodeStyle;
  animation: QRCodeAnimation;
  foregroundColor: string;
  backgroundColor: string;
  urlPlaceholder: string;
  namePrefix: string;
};

/**
 * Available QR Code Templates
 */
export const QR_CODE_TEMPLATES: QRCodeTemplate[] = [
  {
    id: 'url',
    name: 'URL Simple',
    description: 'Lien vers un site web classique',
    icon: Globe,
    style: 'DOTS',
    animation: 'NONE',
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    urlPlaceholder: 'https://exemple.com',
    namePrefix: 'QR Code URL',
  },
  {
    id: 'wifi',
    name: 'WiFi',
    description: 'Connexion WiFi automatique',
    icon: Wifi,
    style: 'ROUNDED',
    animation: 'RIPPLE',
    foregroundColor: '#2563EB',
    backgroundColor: '#EFF6FF',
    urlPlaceholder: 'WIFI:T:WPA;S:NomReseau;P:MotDePasse;;',
    namePrefix: 'QR Code WiFi',
  },
  {
    id: 'vcard',
    name: 'Carte de visite (vCard)',
    description: 'Informations de contact',
    icon: User,
    style: 'CLASSY',
    animation: 'GLOW',
    foregroundColor: '#7C3AED',
    backgroundColor: '#FAF5FF',
    urlPlaceholder:
      'BEGIN:VCARD\nVERSION:3.0\nFN:Nom Prénom\nTEL:+33612345678\nEMAIL:email@exemple.com\nEND:VCARD',
    namePrefix: 'QR Code vCard',
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Envoyer un email pré-rempli',
    icon: Mail,
    style: 'DOTS',
    animation: 'PULSE',
    foregroundColor: '#DC2626',
    backgroundColor: '#FEF2F2',
    urlPlaceholder: 'mailto:contact@exemple.com?subject=Sujet&body=Message',
    namePrefix: 'QR Code Email',
  },
  {
    id: 'phone',
    name: 'Téléphone',
    description: 'Appeler un numéro directement',
    icon: Phone,
    style: 'ROUNDED',
    animation: 'WAVE',
    foregroundColor: '#059669',
    backgroundColor: '#ECFDF5',
    urlPlaceholder: 'tel:+33612345678',
    namePrefix: 'QR Code Téléphone',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Page Facebook',
    icon: Facebook,
    style: 'CIRCULAR',
    animation: 'CIRCULAR_RIPPLE',
    foregroundColor: '#1877F2',
    backgroundColor: '#E7F3FF',
    urlPlaceholder: 'https://facebook.com/votreprofil',
    namePrefix: 'QR Code Facebook',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Profil Instagram',
    icon: Instagram,
    style: 'CLASSY',
    animation: 'ROTATE3D',
    foregroundColor: '#E4405F',
    backgroundColor: '#FFE9EE',
    urlPlaceholder: 'https://instagram.com/votreprofil',
    namePrefix: 'QR Code Instagram',
  },
];

/**
 * Props for the QRCodeTemplateSelector component
 */
interface QRCodeTemplateSelectorProps {
  /** Callback fired when a template is selected */
  onSelect: (template: QRCodeTemplate) => void;
}

/**
 * QRCodeTemplateSelector component for selecting pre-configured templates
 *
 * Displays a grid of template cards with icons and descriptions.
 * When a template is selected, it fires the onSelect callback with the template data.
 *
 * @component
 * @example
 * ```tsx
 * <QRCodeTemplateSelector
 *   onSelect={(template) => {
 *     setUrl(template.urlPlaceholder);
 *     setStyle(template.style);
 *     setAnimation(template.animation);
 *   }}
 * />
 * ```
 */
export default function QRCodeTemplateSelector({ onSelect }: QRCodeTemplateSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">Templates rapides</label>
      <p className="text-xs text-gray-600 mb-4">
        Sélectionnez un template pour pré-remplir les champs avec des configurations optimisées
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {QR_CODE_TEMPLATES.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className="group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-400 hover:shadow-lg transition-all duration-200"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: template.backgroundColor,
                  color: template.foregroundColor,
                }}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-purple-700">
                  {template.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">{template.description}</p>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
