/// API data models — aligned with `packages/api-client` and `openapi/v1.yaml`.
library;

import '../core/utils/media_url.dart';
class AttractionSummary {
  const AttractionSummary({
    required this.id,
    required this.title,
    required this.slug,
    required this.category,
    required this.isFeatured,
    this.shortDesc,
    this.fullDesc,
    this.image,
    this.latitude,
    this.longitude,
    this.openingHours,
    this.bestTimeToVisit,
    this.visitorTips,
    this.audioUrl,
  });

  final String id;
  final String title;
  final String slug;
  final String? shortDesc;
  final String? fullDesc;
  final String? image;
  final String category;
  final bool isFeatured;
  final double? latitude;
  final double? longitude;
  final String? openingHours;
  final String? bestTimeToVisit;
  final String? visitorTips;
  final String? audioUrl;

  factory AttractionSummary.fromJson(Map<String, dynamic> json) {
    return AttractionSummary(
      id: json['id'] as String,
      title: json['title'] as String,
      slug: json['slug'] as String,
      shortDesc: json['short_desc'] as String?,
      fullDesc: json['full_desc'] as String?,
      image: json['image'] as String?,
      category: json['category'] as String,
      isFeatured: json['is_featured'] as bool? ?? false,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      openingHours: json['opening_hours'] as String?,
      bestTimeToVisit: json['best_time_to_visit'] as String?,
      visitorTips: json['visitor_tips'] as String?,
      audioUrl: json['audio_url'] as String?,
    );
  }
}

class GuideSummary {
  const GuideSummary({
    required this.id,
    required this.name,
    required this.slug,
    required this.isAvailable,
    this.photo,
    this.bio,
    this.languages = const [],
    this.specialties = const [],
  });

  final String id;
  final String name;
  final String slug;
  final String? photo;
  final String? bio;
  final List<String> languages;
  final List<String> specialties;
  final bool isAvailable;

  factory GuideSummary.fromJson(Map<String, dynamic> json) {
    return GuideSummary(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      photo: json['photo'] as String?,
      bio: json['bio'] as String?,
      languages: (json['languages'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      specialties: (json['specialties'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      isAvailable: json['is_available'] as bool? ?? false,
    );
  }
}

class MapPoi {
  const MapPoi({
    required this.id,
    required this.title,
    required this.slug,
    required this.category,
    required this.isFeatured,
    this.shortDesc,
    this.image,
    this.latitude,
    this.longitude,
  });

  final String id;
  final String title;
  final String slug;
  final String category;
  final String? shortDesc;
  final String? image;
  final double? latitude;
  final double? longitude;
  final bool isFeatured;

  factory MapPoi.fromJson(Map<String, dynamic> json) {
    return MapPoi(
      id: json['id'] as String,
      title: json['title'] as String,
      slug: json['slug'] as String,
      category: json['category'] as String,
      shortDesc: json['short_desc'] as String?,
      image: json['image'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      isFeatured: json['is_featured'] as bool? ?? false,
    );
  }
}

class ItineraryDayItem {
  const ItineraryDayItem({
    required this.title,
    this.description,
    this.attractionSlug,
  });

  final String title;
  final String? description;
  final String? attractionSlug;

  factory ItineraryDayItem.fromJson(Map<String, dynamic> json) {
    return ItineraryDayItem(
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      attractionSlug: json['attraction_slug'] as String?,
    );
  }
}

class ItineraryDay {
  const ItineraryDay({required this.label, this.items = const []});

  final String label;
  final List<ItineraryDayItem> items;

  factory ItineraryDay.fromJson(Map<String, dynamic> json) {
    return ItineraryDay(
      label: json['label'] as String? ?? '',
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => ItineraryDayItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );
  }
}

class ItinerarySummary {
  const ItinerarySummary({
    required this.id,
    required this.title,
    required this.slug,
    required this.duration,
    this.summary,
    this.days = const [],
  });

  final String id;
  final String title;
  final String slug;
  final String duration;
  final String? summary;
  final List<ItineraryDay> days;

  factory ItinerarySummary.fromJson(Map<String, dynamic> json) {
    return ItinerarySummary(
      id: json['id'] as String,
      title: json['title'] as String,
      slug: json['slug'] as String,
      duration: json['duration'] as String? ?? '',
      summary: json['summary'] as String?,
      days: (json['days'] as List<dynamic>?)
              ?.map((e) => ItineraryDay.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );
  }
}

class AnnouncementSummary {
  const AnnouncementSummary({
    required this.id,
    required this.title,
    required this.slug,
    required this.type,
    this.body,
    this.coverImage,
    this.eventDate,
    this.eventLocation,
    this.publishedAt,
    this.registrationEnabled = false,
    this.registration,
  });

  final String id;
  final String title;
  final String slug;
  final String type;
  final String? body;
  final String? coverImage;
  final String? eventDate;
  final String? eventLocation;
  final String? publishedAt;
  final bool registrationEnabled;
  final EventRegistrationMeta? registration;

  factory AnnouncementSummary.fromJson(Map<String, dynamic> json) {
    return AnnouncementSummary(
      id: json['id'] as String,
      title: json['title'] as String,
      slug: json['slug'] as String,
      type: json['type'] as String? ?? 'News',
      body: json['body'] as String?,
      coverImage: json['cover_image'] as String?,
      eventDate: json['event_date'] as String?,
      eventLocation: json['event_location'] as String?,
      publishedAt: json['published_at'] as String?,
      registrationEnabled: json['registration_enabled'] as bool? ?? false,
      registration: json['registration'] != null
          ? EventRegistrationMeta.fromJson(
              json['registration'] as Map<String, dynamic>,
            )
          : null,
    );
  }
}

class EventRegistrationMeta {
  const EventRegistrationMeta({
    required this.registrationEnabled,
    this.registrationCapacity,
    this.registrationDeadline,
    this.registrationNote,
    required this.registeredCount,
    this.spotsRemaining,
    required this.registrationOpen,
  });

  final bool registrationEnabled;
  final int? registrationCapacity;
  final String? registrationDeadline;
  final String? registrationNote;
  final int registeredCount;
  final int? spotsRemaining;
  final bool registrationOpen;

  factory EventRegistrationMeta.fromJson(Map<String, dynamic> json) {
    return EventRegistrationMeta(
      registrationEnabled: json['registration_enabled'] as bool? ?? false,
      registrationCapacity: json['registration_capacity'] as int?,
      registrationDeadline: json['registration_deadline'] as String?,
      registrationNote: json['registration_note'] as String?,
      registeredCount: json['registered_count'] as int? ?? 0,
      spotsRemaining: json['spots_remaining'] as int?,
      registrationOpen: json['registration_open'] as bool? ?? false,
    );
  }
}

class EventRegistrationInput {
  const EventRegistrationInput({
    required this.announcementId,
    required this.visitorName,
    required this.visitorEmail,
    required this.visitorCountry,
    required this.partySize,
    this.visitorPhone,
    this.specialRequests,
  });

  final String announcementId;
  final String visitorName;
  final String visitorEmail;
  final String visitorCountry;
  final int partySize;
  final String? visitorPhone;
  final String? specialRequests;

  Map<String, dynamic> toJson() => {
        'announcement_id': announcementId,
        'visitor_name': visitorName,
        'visitor_email': visitorEmail,
        'visitor_country': visitorCountry,
        'party_size': partySize,
        if (visitorPhone != null) 'visitor_phone': visitorPhone,
        if (specialRequests != null) 'special_requests': specialRequests,
      };
}

class EventRegistrationResult {
  const EventRegistrationResult({
    required this.registrationRef,
    required this.status,
    this.qrToken,
  });

  final String registrationRef;
  final String status;
  final String? qrToken;

  factory EventRegistrationResult.fromJson(Map<String, dynamic> json) {
    return EventRegistrationResult(
      registrationRef: json['registration_ref'] as String,
      status: json['status'] as String? ?? 'Pending',
      qrToken: json['qr_token'] as String?,
    );
  }
}

class EventRegistrationStatusInput {
  const EventRegistrationStatusInput({
    required this.registrationRef,
    required this.visitorEmail,
  });

  final String registrationRef;
  final String visitorEmail;

  Map<String, dynamic> toJson() => {
        'registration_ref': registrationRef,
        'visitor_email': visitorEmail,
      };
}

class EventRegistrationStatus {
  const EventRegistrationStatus({
    required this.registrationRef,
    required this.status,
    required this.eventTitle,
    this.eventDate,
    this.eventLocation,
    required this.partySize,
    this.statusNote,
    this.qrToken,
  });

  final String registrationRef;
  final String status;
  final String eventTitle;
  final String? eventDate;
  final String? eventLocation;
  final int partySize;
  final String? statusNote;
  final String? qrToken;

  factory EventRegistrationStatus.fromJson(Map<String, dynamic> json) {
    return EventRegistrationStatus(
      registrationRef: json['registration_ref'] as String,
      status: json['status'] as String? ?? 'Pending',
      eventTitle: json['event_title'] as String? ?? '',
      eventDate: json['event_date'] as String?,
      eventLocation: json['event_location'] as String?,
      partySize: json['party_size'] as int? ?? 1,
      statusNote: json['status_note'] as String?,
      qrToken: json['qr_token'] as String?,
    );
  }
}

class PaginatedAnnouncements {
  const PaginatedAnnouncements({
    required this.items,
    required this.total,
    required this.page,
    required this.perPage,
  });

  final List<AnnouncementSummary> items;
  final int total;
  final int page;
  final int perPage;

  factory PaginatedAnnouncements.fromJson(Map<String, dynamic> json) {
    return PaginatedAnnouncements(
      items: (json['items'] as List<dynamic>?)
              ?.map((e) =>
                  AnnouncementSummary.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      total: json['total'] as int? ?? 0,
      page: json['page'] as int? ?? 1,
      perPage: json['perPage'] as int? ?? 20,
    );
  }
}

class SearchResultItem {
  const SearchResultItem({
    required this.type,
    required this.id,
    required this.title,
    required this.slug,
    required this.excerpt,
    required this.href,
    this.image,
    this.meta,
  });

  final String type;
  final String id;
  final String title;
  final String slug;
  final String excerpt;
  final String href;
  final String? image;
  final String? meta;

  factory SearchResultItem.fromJson(Map<String, dynamic> json) {
    return SearchResultItem(
      type: json['type'] as String? ?? '',
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      excerpt: json['excerpt'] as String? ?? '',
      href: json['href'] as String? ?? '',
      image: json['image'] as String?,
      meta: json['meta'] as String?,
    );
  }
}

class SearchResult {
  const SearchResult({required this.query, this.results = const []});

  final String query;
  final List<SearchResultItem> results;

  factory SearchResult.fromJson(Map<String, dynamic> json) {
    return SearchResult(
      query: json['query'] as String? ?? '',
      results: (json['results'] as List<dynamic>?)
              ?.map((e) => SearchResultItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );
  }
}

class BookingInput {
  const BookingInput({
    required this.guideId,
    required this.visitorName,
    required this.visitorEmail,
    required this.visitorCountry,
    required this.tourDate,
    required this.tourDuration,
    required this.groupSize,
    this.visitorPhone,
    this.specialRequests,
  });

  final String guideId;
  final String visitorName;
  final String visitorEmail;
  final String visitorCountry;
  final String tourDate;
  final String tourDuration;
  final int groupSize;
  final String? visitorPhone;
  final String? specialRequests;

  Map<String, dynamic> toJson() => {
        'guide_id': guideId,
        'visitor_name': visitorName,
        'visitor_email': visitorEmail,
        'visitor_country': visitorCountry,
        'tour_date': tourDate,
        'tour_duration': tourDuration,
        'group_size': groupSize,
        if (visitorPhone != null) 'visitor_phone': visitorPhone,
        if (specialRequests != null) 'special_requests': specialRequests,
      };
}

class BookingStatusInput {
  const BookingStatusInput({
    required this.bookingRef,
    required this.visitorEmail,
  });

  final String bookingRef;
  final String visitorEmail;

  Map<String, dynamic> toJson() => {
        'booking_ref': bookingRef,
        'visitor_email': visitorEmail,
      };
}

class BookingStatus {
  const BookingStatus({
    required this.bookingRef,
    required this.status,
    required this.guideName,
    required this.tourDate,
    required this.tourDuration,
    required this.groupSize,
    this.statusNote,
  });

  final String bookingRef;
  final String status;
  final String guideName;
  final String tourDate;
  final String tourDuration;
  final int groupSize;
  final String? statusNote;

  factory BookingStatus.fromJson(Map<String, dynamic> json) {
    return BookingStatus(
      bookingRef: json['booking_ref'] as String? ?? '',
      status: json['status'] as String? ?? '',
      guideName: json['guide_name'] as String? ?? '',
      tourDate: json['tour_date'] as String? ?? '',
      tourDuration: json['tour_duration'] as String? ?? '',
      groupSize: json['group_size'] as int? ?? 0,
      statusNote: json['status_note'] as String?,
    );
  }
}

class PushRegisterInput {
  const PushRegisterInput({
    required this.expoPushToken,
    this.visitorEmail,
    this.notifyBookings,
    this.notifyEvents,
    this.platform,
  });

  final String expoPushToken;
  final String? visitorEmail;
  final bool? notifyBookings;
  final bool? notifyEvents;
  final String? platform;

  Map<String, dynamic> toJson() => {
        'expo_push_token': expoPushToken,
        if (visitorEmail != null) 'visitor_email': visitorEmail,
        if (notifyBookings != null) 'notify_bookings': notifyBookings,
        if (notifyEvents != null) 'notify_events': notifyEvents,
        if (platform != null) 'platform': platform,
      };
}

class HeroContent {
  const HeroContent({
    this.badgeText,
    this.headline,
    this.headlineItalic,
    this.subheading,
    this.ctaPrimaryText,
    this.ctaPrimaryUrl,
    this.ctaGhostText,
    this.ctaGhostUrl,
    this.backgroundImage,
    this.stat1Number,
    this.stat1Label,
    this.stat2Number,
    this.stat2Label,
    this.stat3Number,
    this.stat3Label,
  });

  final String? badgeText;
  final String? headline;
  final String? headlineItalic;
  final String? subheading;
  final String? ctaPrimaryText;
  final String? ctaPrimaryUrl;
  final String? ctaGhostText;
  final String? ctaGhostUrl;
  final String? backgroundImage;
  final String? stat1Number;
  final String? stat1Label;
  final String? stat2Number;
  final String? stat2Label;
  final String? stat3Number;
  final String? stat3Label;

  factory HeroContent.fromJson(Map<String, dynamic> json) {
    return HeroContent(
      badgeText: json['badge_text'] as String?,
      headline: json['headline'] as String?,
      headlineItalic: json['headline_italic'] as String?,
      subheading: json['subheading'] as String?,
      ctaPrimaryText: json['cta_primary_text'] as String?,
      ctaPrimaryUrl: json['cta_primary_url'] as String?,
      ctaGhostText: json['cta_ghost_text'] as String?,
      ctaGhostUrl: json['cta_ghost_url'] as String?,
      backgroundImage: json['background_image'] as String?,
      stat1Number: json['stat_1_number'] as String?,
      stat1Label: json['stat_1_label'] as String?,
      stat2Number: json['stat_2_number'] as String?,
      stat2Label: json['stat_2_label'] as String?,
      stat3Number: json['stat_3_number'] as String?,
      stat3Label: json['stat_3_label'] as String?,
    );
  }

  List<({String number, String label})> get stats {
    final items = <({String number, String label})>[];
    void add(String? n, String? l) {
      if (n != null && n.isNotEmpty && l != null && l.isNotEmpty) {
        items.add((number: n, label: l));
      }
    }

    add(stat1Number, stat1Label);
    add(stat2Number, stat2Label);
    add(stat3Number, stat3Label);
    return items;
  }
}

class WorkingHoursRow {
  const WorkingHoursRow({required this.day, required this.hours});

  final String day;
  final String hours;

  factory WorkingHoursRow.fromJson(Map<String, dynamic> json) {
    return WorkingHoursRow(
      day: json['day'] as String? ?? '',
      hours: json['hours'] as String? ?? '',
    );
  }
}

class ContactInfo {
  const ContactInfo({
    required this.id,
    this.officeName,
    this.addressLine1,
    this.addressLine2,
    this.country,
    this.phonePrimary,
    this.phoneSecondary,
    this.emailGeneral,
    this.emailBookings,
    this.workingHours = const [],
    this.mapLat,
    this.mapLng,
    this.facebookUrl,
    this.twitterUrl,
    this.instagramUrl,
  });

  final String id;
  final String? officeName;
  final String? addressLine1;
  final String? addressLine2;
  final String? country;
  final String? phonePrimary;
  final String? phoneSecondary;
  final String? emailGeneral;
  final String? emailBookings;
  final List<WorkingHoursRow> workingHours;
  final double? mapLat;
  final double? mapLng;
  final String? facebookUrl;
  final String? twitterUrl;
  final String? instagramUrl;

  factory ContactInfo.fromJson(Map<String, dynamic> json) {
    return ContactInfo(
      id: json['id'] as String? ?? '',
      officeName: json['office_name'] as String?,
      addressLine1: json['address_line1'] as String?,
      addressLine2: json['address_line2'] as String?,
      country: json['country'] as String?,
      phonePrimary: json['phone_primary'] as String?,
      phoneSecondary: json['phone_secondary'] as String?,
      emailGeneral: json['email_general'] as String?,
      emailBookings: json['email_bookings'] as String?,
      workingHours: (json['working_hours'] as List<dynamic>?)
              ?.map((e) => WorkingHoursRow.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      mapLat: (json['map_lat'] as num?)?.toDouble(),
      mapLng: (json['map_lng'] as num?)?.toDouble(),
      facebookUrl: json['facebook_url'] as String?,
      twitterUrl: json['twitter_url'] as String?,
      instagramUrl: json['instagram_url'] as String?,
    );
  }
}

class InquiryInput {
  const InquiryInput({
    required this.name,
    required this.email,
    required this.subject,
    required this.message,
  });

  final String name;
  final String email;
  final String subject;
  final String message;

  Map<String, dynamic> toJson() => {
        'name': name,
        'email': email,
        'subject': subject,
        'message': message,
      };
}

const partnerCategories = [
  'Hotel',
  'Restaurant',
  'Coffee',
  'Transport',
  'Forex',
  'Other',
];

class PartnerSummary {
  const PartnerSummary({
    required this.id,
    required this.name,
    required this.slug,
    required this.category,
    this.description,
    this.address,
    this.phone,
    this.email,
    this.website,
    this.image,
    this.isFeatured = false,
  });

  final String id;
  final String name;
  final String slug;
  final String category;
  final String? description;
  final String? address;
  final String? phone;
  final String? email;
  final String? website;
  final String? image;
  final bool isFeatured;

  factory PartnerSummary.fromJson(Map<String, dynamic> json) {
    return PartnerSummary(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      category: json['category'] as String? ?? '',
      description: json['description'] as String?,
      address: json['address'] as String?,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      website: json['website'] as String?,
      image: json['image'] as String?,
      isFeatured: json['is_featured'] as bool? ?? false,
    );
  }
}

class GalleryAlbumSummary {
  const GalleryAlbumSummary({
    required this.id,
    required this.title,
    this.description,
    this.coverImage,
    this.itemCount = 0,
  });

  final String id;
  final String title;
  final String? description;
  final String? coverImage;
  final int itemCount;

  factory GalleryAlbumSummary.fromJson(Map<String, dynamic> json) {
    return GalleryAlbumSummary(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      coverImage: json['cover_image'] as String?,
      itemCount: json['item_count'] as int? ?? 0,
    );
  }
}

class GalleryItem {
  const GalleryItem({
    required this.id,
    required this.albumId,
    required this.type,
    required this.url,
    this.thumbnailUrl,
    this.caption,
    this.altText,
  });

  final String id;
  final String albumId;
  final String type;
  final String url;
  final String? thumbnailUrl;
  final String? caption;
  final String? altText;

  String get displayUrl => pickListImageUrl(url, thumbnailUrl: thumbnailUrl) ?? url;

  factory GalleryItem.fromJson(Map<String, dynamic> json) {
    return GalleryItem(
      id: json['id'] as String? ?? '',
      albumId: json['album_id'] as String? ?? '',
      type: json['type'] as String? ?? 'image',
      url: json['url'] as String? ?? '',
      thumbnailUrl: json['thumbnail_url'] as String?,
      caption: json['caption'] as String?,
      altText: json['alt_text'] as String?,
    );
  }
}

class GalleryAlbumDetail {
  const GalleryAlbumDetail({
    required this.album,
    this.items = const [],
  });

  final GalleryAlbumSummary album;
  final List<GalleryItem> items;

  factory GalleryAlbumDetail.fromJson(Map<String, dynamic> json) {
    final albumJson = json['album'] as Map<String, dynamic>? ?? json;
    return GalleryAlbumDetail(
      album: GalleryAlbumSummary.fromJson(albumJson),
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => GalleryItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );
  }
}

class ApiException implements Exception {
  ApiException(this.code, this.message, {this.statusCode = 0});

  final String code;
  final String message;
  final int statusCode;

  @override
  String toString() => '$code: $message';
}

List<T> parseList<T>(
  dynamic json,
  T Function(Map<String, dynamic>) fromJson,
) {
  return (json as List<dynamic>)
      .map((e) => fromJson(e as Map<String, dynamic>))
      .toList();
}

T parseModel<T>(
  dynamic json,
  T Function(Map<String, dynamic>) fromJson,
) {
  return fromJson(json as Map<String, dynamic>);
}
