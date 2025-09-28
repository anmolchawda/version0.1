// src/hooks/useTranslations.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

// Define a type for your translation keys
// This can be expanded as you add more translations
export type TranslationKey =
  | 'feed' | 'discover' | 'create' | 'mandi' | 'profile'
  | 'cropScience' | 'weather' | 'yojna' | 'events'
  | 'fungicides' | 'insecticides' | 'iracCode' | 'fracCode'
  | 'settings' | 'logout'
  | 'selectLanguageTitle' | 'selectLanguageSubtitle'
  | 'reloadRecommendedTitle' | 'reloadRecommendedDescription'
  | 'reloadLater' | 'reloadNow'
  | 'languagePreferenceSavedTitle' | 'languagePreferenceSavedDescription'
  | 'accountSettingsTitle'
  | 'commentsTitle' | 'noCommentsYet' | 'addCommentPlaceholder'
  | 'replyingToPlaceholder' | 'cancelReply' | 'postCommentButton' | 'postReplyButton'
  | 'emptyCommentErrorTitle' | 'emptyCommentErrorDescription'
  | 'commentPostedSuccess' | 'replyPostedSuccess'
  | 'createPostTitle' | 'captionLabel' | 'captionPlaceholder'
  | 'mediaLabel' | 'uploadFileButton' | 'dragAndDropText' | 'mediaFormatsAccepted'
  | 'videoDurationWarning' | 'hashtagsLabel' | 'hashtagsPlaceholder'
  | 'sharePostButton' | 'postingButton'
  | 'emptyPostErrorTitle' | 'emptyPostErrorDescription'
  | 'postCreatedSuccessTitle' | 'postCreatedSuccessDescription'
  | 'suggestHashtagsButton' | 'suggestingHashtagsText' | 'aiSuggestedHashtagsLabel' | 'noSuggestionsFoundText'
  | 'posts' | 'followers' | 'following' | 'specializesIn' | 'follow' | 'message' | 'editProfile'
  | 'settingsAccount' | 'settingsPayments' | 'settingsLanguage' | 'settingsDevices'
  | 'settingsUploads' | 'settingsStats' | 'settingsFavorites' | 'settingsHelp'
  | 'aiFeatures'
  | 'aiCropHealthAnalyzerTitle' | 'aiCropHealthAnalyzerDescription'
  | 'aiUploadCropImageLabel' | 'aiChangeImageButton' | 'aiUploadAnImageButton'
  | 'aiImageFormatsAcceptedWithLimit' | 'aiAnalyzingButton' | 'aiAnalyzeImageButton'
  | 'aiAnalyzingImageText' | 'aiAnalyzingWaitText' | 'aiAnalysisErrorAlertTitle'
  | 'aiAnalysisResultsTitle' | 'aiObjectIdentificationTitle' | 'aiObjectNotIdentifiedDescription'
  | 'aiPlantIdentifiedTitle' | 'aiPlantIdentifiedDefaultDescription'
  | 'aiAnalysisDetailDiseaseTitle' | 'aiAnalysisDetailNutrientTitle' | 'aiAnalysisDetailInsectTitle' | 'aiAnalysisDetailWeedTitle'
  | 'aiAnalysisDetailNoIssueDetected' | 'aiOverallAssessmentTitle' | 'aiSuggestionsTitle'
  | 'toastImageTooLargeTitle' | 'toastImageTooLargeDescription'
  | 'aiDragAndDropText'
  | 'toastNoImageSelectedTitle' | 'toastNoImageSelectedDescription'
  | 'toastAnalysisFailedTitle' | 'toastAnalysisFailedDescription'
  | 'likeCountSingular' | 'likeCountPlural'
  | 'viewAllCommentsText'
  | 'postUnsavedToastTitle' | 'postUnsavedToastDescription'
  | 'postSavedToastTitle' | 'postSavedToastDescription'
  | 'errorToastTitle' | 'likeUpdateErrorToastDescription'
  | 'postLikedMockToastTitle' | 'postUnlikedMockToastTitle'
  | 'mandiTitle' | 'mandiDescription'
  | 'profilePhotoLabel' | 'changePhotoButton' | 'imageUploadHelperText'
  | 'usernameLabel' | 'usernamePlaceholder' | 'fullNameLabel' | 'fullNamePlaceholder'
  | 'bioLabel' | 'bioPlaceholder' | 'locationLabel' | 'locationPlaceholder'
  | 'produceLabel' | 'producePlaceholder' | 'savingChangesButton' | 'saveChangesButton'
  | 'phoneNumberLabel' | 'phoneNumberPlaceholder' | 'phoneNumberPlaceholderOptional'
  | 'toastNotAuthenticatedTitle' | 'toastNotAuthenticatedDescription'
  | 'toastProfileUpdatedMockTitle' | 'toastProfileUpdatedMockDescription'
  | 'toastProfileUpdatedTitle' | 'toastProfileUpdatedDescription'
  | 'toastUpdateFailedTitle' | 'toastUpdateFailedDescription'
  | 'backToSettingsButton' | 'backToProfileButton'
  | 'backButton' | 'likeAction' | 'commentAction' | 'shareAction' | 'saveAction'
  | 'unsaveAction' | 'replyButtonText' | 'likesLabel'
  | 'discoverUniversalSearchTitle' | 'discoverSearchPlaceholder'
  | 'discoverInitialSearchPromptTitle' | 'discoverInitialSearchPromptDescription'
  | 'discoverNoResultsFound' | 'discoverNoResultsSuggestion'
  | 'discoverMatchingFarmersTitle' | 'discoverMatchingPostsTitle' | 'discoverMatchingMandiTitle'
  | 'discoverMatchingDiseasesTitle' | 'discoverMatchingEventsTitle' | 'discoverMatchingYojnasTitle'
  | 'discoverMatchingCropsTitle' | 'discoverInfoFooter'
  | 'messagesTitle' | 'newMessageAriaLabel' | 'searchMessagesPlaceholder'
  | 'noMessagesYetTitle' | 'noMessagesYetDescription' | 'startNewChatButton'
  | 'noPostsYetTitle' | 'noPostsYetDescription'
  | 'userNotAuthenticatedError' | 'failedToLoadConversationsError'
  | 'newMessageModalTitle' | 'newMessageModalDescription' | 'searchUsersPlaceholder'
  | 'noUsersFoundError'
  | 'notificationsTitle' | 'notificationsDescription' | 'clearAllButton'
  | 'loadingNotificationsText' | 'loginToViewNotificationsText' | 'loginButtonText'
  | 'failedToLoadNotificationsError' | 'allCaughtUpTitle' | 'noNewNotificationsText'
  | 'confirmClearAllTitle' | 'confirmClearAllDescription' | 'cancelButtonText' | 'clearAllConfirmButton'
  | 'toastNotificationsClearedMockTitle' | 'toastNotificationsClearedMockDescription'
  | 'toastNoNotificationsToClearTitle' | 'toastNoNotificationsToClearDescription'
  | 'toastNotificationsClearedTitle' | 'toastNotificationsClearedDescription'
  | 'toastErrorClearingNotificationsTitle' | 'toastErrorClearingNotificationsDescription'
  | 'likedYourPostText' | 'commentedOnYourPostText' | 'onYourPostText' | 'startedFollowingYouText' | 'newNotificationText'
  | 'loadingFeedText'
  | 'mandiViewAsBuyer' | 'mandiViewAsSeller' // Deprecated, replaced by specific tab labels
  | 'mandiMarketplaceTab' | 'mandiBuyerRequestsTab' | 'mandiMyProductsTab' | 'mandiRatesTab' // New tab labels
  | 'mandiMarketplaceListings' | 'mandiYourListingsTitle' // Deprecated page titles, now more dynamic
  | 'mandiBuyerRequestsTitle' | 'mandiMyProductsForSaleTitle' // New page titles
  | 'mandiListNewItem' | 'mandiListRequirementButton'
  | 'mandiNoListingsBuyerPrompt' | 'mandiNoListingsBuyerSuggestion'
  | 'mandiNoListingsSellerPrompt' | 'mandiNoListingsSellerSuggestion'
  | 'mandiNoBuyerRequestsPrompt' | 'mandiNoBuyerRequestsSuggestion' | 'mandiPostNewRequirementButton'
  | 'myListingsButton'
  | 'backToMandiButton' | 'mandiAddRequirementTitle' | 'mandiAddRequirementDescription'
  | 'mandiAddRequirementItemNameLabel' | 'mandiAddRequirementItemNamePlaceholder'
  | 'mandiAddRequirementCategoryLabel' | 'mandiAddRequirementCategoryPlaceholder'
  | 'mandiAddRequirementQuantityLabel' | 'mandiAddRequirementQuantityPlaceholder'
  | 'mandiAddRequirementLocationLabel' | 'mandiAddRequirementLocationPlaceholder'
  | 'mandiAddRequirementSpecsLabel' | 'mandiAddRequirementSpecsPlaceholder'
  | 'mandiAddRequirementNote' | 'mandiAddRequirementSubmitButton' | 'mandiAddRequirementSubmittingButton'
  | 'mandiAddRequirementMissingInfoTitle' | 'mandiAddRequirementMissingInfoDesc'
  | 'mandiAddRequirementSuccessTitle' | 'mandiAddRequirementSuccessDesc'
  | 'mandiSearchPlaceholder' | 'mandiFilterByCategory' | 'mandiFilterByState' | 'mandiFilterByCity'
  | 'mandiSelectStateFirst' | 'mandiNoCitiesForState' | 'mandiResetFiltersButton'
  | 'mandiRequirementPostedOn' | 'mandiContactBuyerButton' | 'mandiDeleteRequirementButton'
  | 'mandiDeleteConfirmTitle' | 'mandiDeleteConfirmDesc' | 'mandiDeleteButtonConfirm'
  | 'mandiRequirementDeletedTitle' | 'mandiRequirementDeletedDesc'
  | 'featureComingSoonTitle' | 'featureComingSoonDescription'
  | 'databaseNotAvailableError'
  | 'yojnasTitle'
 | 'likesByTitle'
 | 'noLikesYet'
 | 'loadMoreComments'
  | 'failedToLoadYojnasError'
  | 'learnMoreButton'
  | 'noYojnasFoundTitle'
  | 'noYojnasFoundDescription'
  | 'loadMoreReplies'
  // Added for comment actions
  | 'editComment' | 'deleteComment' | 'deleteCommentConfirmTitle'
  | 'deleteCommentConfirmDescription' | 'deleteConfirmButton'
 | 'hideReplies'
  | 'viewReplies'
  | 'commentUpdatedSuccess' | 'commentDeletedSuccess'
  | 'commentUpdateFailed' | 'commentDeleteFailed'
  | 'saveButton'
  ;


type Translations = Record<TranslationKey, string>;

const DEFAULT_LANG = 'en';

async function loadTranslations(lang: string): Promise<Translations> {
  try {
    let translations;
    if (lang === 'hi') {
      translations = (await import(`../locales/hi.json`)).default;
    } else if (lang === 'hne') {
      translations = (await import(`../locales/cg.json`)).default;
    } else if (lang === 'mr') {
      translations = (await import(`../locales/mh.json`)).default;
    } else if (lang === 'kn') {
      translations = (await import(`../locales/kn.json`)).default;
    } else if (lang === 'ta') {
      translations = (await import(`../locales/ta.json`)).default;
    } else if (lang === 'te') {
      translations = (await import(`../locales/tg.json`)).default;
    } else if (lang === 'gu') {
      translations = (await import(`../locales/gu.json`)).default;
    } else if (lang === 'pa' || lang === 'pu') { // Added 'pu' as an alias for Punjabi
      translations = (await import(`../locales/pu.json`)).default;
    } else if (lang === 'ml' || lang === 'ma') { // Added 'ma' as an alias for Malayalam
      translations = (await import(`../locales/ma.json`)).default;
    } else if (lang === 'or') {
      translations = (await import(`../locales/or.json`)).default;
    } else if (lang === 'bn') {
      translations = (await import(`../locales/bn.json`)).default;
    } else if (lang === 'bho') {
      translations = (await import(`../locales/bho.json`)).default;
    }
     else {
      translations = (await import(`../locales/en.json`)).default;
    }
    return translations;
  } catch (error) {
    console.warn(`Could not load translations for language: ${lang}. Falling back to English.`, error);
    return (await import(`../locales/en.json`)).default; // Fallback to English
  }
}

export function useTranslations() {
  const [language, setLanguage] = useState(DEFAULT_LANG);
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedLanguage = localStorage.getItem('selectedAppLanguage');
    const initialLang = storedLanguage || DEFAULT_LANG;
    setLanguage(initialLang);

    const fetchTranslations = async () => {
      setIsLoading(true);
      const loadedTranslations = await loadTranslations(initialLang);
      setTranslations(loadedTranslations);
      setIsLoading(false);
    };
    fetchTranslations();

    const handleStorageChange = async (event: StorageEvent) => {
      if (event.key === 'selectedAppLanguage' && event.newValue) {
        setLanguage(event.newValue);
        setIsLoading(true);
        const newTranslations = await loadTranslations(event.newValue);
        setTranslations(newTranslations);
        setIsLoading(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    if (isLoading || !translations) {
      // Fallback to a more descriptive placeholder during loading or if translations are missing
      const paramString = params ? ` (${JSON.stringify(params)})` : '';
      return `[${key}${paramString}]`;
    }
    let translation = translations[key] || `[Missing: ${key}]`; // Fallback to key if not found
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(new RegExp(`{${paramKey}}`, 'g'), String(params[paramKey]));
      });
    }
    return translation;
  }, [translations, isLoading]);

  return { t, currentLanguage: language, isLoadingTranslations: isLoading };
}
