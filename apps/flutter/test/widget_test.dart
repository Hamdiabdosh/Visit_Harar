import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:visit_harar/api/models.dart';
import 'package:visit_harar/core/utils/media_url.dart';
import 'package:visit_harar/config/env.dart';
import 'package:visit_harar/core/map/tile_utils.dart';
import 'package:visit_harar/core/storage/favorites_storage.dart';
import 'package:visit_harar/core/storage/recent_booking_storage.dart';
import 'package:visit_harar/routing/app_router.dart';
import 'package:visit_harar/features/booking/booking_constants.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('default API v1 URL points at production', () {
    expect(
      Env.apiV1,
      'https://visitharar.raafat.site/api/v1',
    );
  });

  test('AttractionSummary parses API snake_case JSON', () {
    final item = AttractionSummary.fromJson({
      'id': 'abc',
      'title': 'Harar Gate',
      'slug': 'harar-gate',
      'category': 'Historic',
      'is_featured': true,
      'short_desc': 'Old city entrance',
    });
    expect(item.slug, 'harar-gate');
    expect(item.isFeatured, isTrue);
  });

  test('favorites toggle saves and removes slug', () async {
    SharedPreferences.setMockInitialValues({});
    expect(await FavoritesStorage.isFavorite('jugol-gate'), isFalse);

    final saved = await FavoritesStorage.toggle(
      slug: 'jugol-gate',
      title: 'Jugol Gate',
      category: 'Historic',
    );
    expect(saved, isTrue);
    expect(await FavoritesStorage.isFavorite('jugol-gate'), isTrue);

    final removed = await FavoritesStorage.toggle(
      slug: 'jugol-gate',
      title: 'Jugol Gate',
      category: 'Historic',
    );
    expect(removed, isFalse);
    expect(await FavoritesStorage.getAll(), isEmpty);
  });

  test('tilesForBounds returns grid for Jugol at z14', () {
    final tiles = tilesForBounds(
      north: 9.3185,
      south: 9.308,
      east: 42.132,
      west: 42.12,
      zoom: 14,
    );
    expect(tiles, isNotEmpty);
    expect(tiles.first.z, 14);
  });

  test('recent booking storage round-trips', () async {
    SharedPreferences.setMockInitialValues({});
    await RecentBookingStorage.save(
      const RecentBookingLookup(
        bookingRef: 'HRR-2026-00001',
        visitorEmail: 'visitor@example.com',
      ),
    );
    final loaded = await RecentBookingStorage.load();
    expect(loaded?.bookingRef, 'HRR-2026-00001');
    expect(loaded?.visitorEmail, 'visitor@example.com');
  });

  test('formatTourDate renders readable label', () {
    expect(
      BookingConstants.formatTourDate('2026-06-13'),
      contains('2026'),
    );
  });

  test('HeroContent parses CMS hero JSON', () {
    final hero = HeroContent.fromJson({
      'headline': 'Discover',
      'headline_italic': 'Harar',
      'background_image': 'https://cdn.example/hero.jpg',
      'stat_1_number': '82',
      'stat_1_label': 'Mosques',
    });
    expect(hero.headline, 'Discover');
    expect(hero.stats, hasLength(1));
  });

  test('resolveMediaUrl handles absolute and relative paths', () {
    expect(resolveMediaUrl('https://x/y.jpg'), 'https://x/y.jpg');
    expect(resolveMediaUrl('/uploads/a.jpg'), contains('/uploads/a.jpg'));
    expect(resolveMediaUrl(null), isNull);
  });

  test('SearchResultItem parses image and meta fields', () {
    final item = SearchResultItem.fromJson({
      'type': 'attraction',
      'id': '1',
      'title': 'Jugol Gate',
      'slug': 'jugol-gate',
      'excerpt': 'Historic entrance',
      'href': '/attractions/jugol-gate',
      'image': '/uploads/gate.jpg',
      'meta': 'Historic',
    });
    expect(item.image, '/uploads/gate.jpg');
    expect(item.meta, 'Historic');
  });

  test('ContactInfo parses working hours and map coordinates', () {
    final contact = ContactInfo.fromJson({
      'id': 'c1',
      'office_name': 'Harari Tourism Commission',
      'address_line1': 'Jugol',
      'country': 'Ethiopia',
      'phone_primary': '+251911000000',
      'email_general': 'info@example.com',
      'working_hours': [
        {'day': 'Mon–Fri', 'hours': '8:30–17:00'},
      ],
      'map_lat': 9.312,
      'map_lng': 42.128,
    });
    expect(contact.officeName, 'Harari Tourism Commission');
    expect(contact.workingHours, hasLength(1));
    expect(contact.mapLat, closeTo(9.312, 0.001));
  });

  test('InquiryInput serializes inquiry payload', () {
    const input = InquiryInput(
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'Visit question',
      message: 'I would like to know about guided tours.',
    );
    expect(input.toJson(), {
      'name': 'Jane Doe',
      'email': 'jane@example.com',
      'subject': 'Visit question',
      'message': 'I would like to know about guided tours.',
    });
  });

  test('ItineraryDayItem parses linked attraction slug', () {
    final item = ItineraryDayItem.fromJson({
      'title': 'Jugol walking tour',
      'description': 'Explore the walled city gates.',
      'attraction_slug': 'jugol-walled-city',
    });
    expect(item.attractionSlug, 'jugol-walled-city');
    expect(item.description, contains('walled city'));
  });

  test('PartnerSummary parses featured partner fields', () {
    final partner = PartnerSummary.fromJson({
      'id': 'p1',
      'name': 'Harar Hotel',
      'slug': 'harar-hotel',
      'category': 'Hotel',
      'description': 'Central stay in Jugol.',
      'phone': '+251911000000',
      'website': 'https://example.com',
      'image': '/uploads/hotel.jpg',
      'is_featured': true,
    });
    expect(partner.isFeatured, isTrue);
    expect(partner.category, 'Hotel');
  });

  test('GalleryAlbumDetail parses album and items', () {
    final detail = GalleryAlbumDetail.fromJson({
      'album': {
        'id': 'a1',
        'title': 'Jugol streets',
        'cover_image': '/uploads/cover.jpg',
        'item_count': 1,
      },
      'items': [
        {
          'id': 'i1',
          'album_id': 'a1',
          'type': 'image',
          'url': '/uploads/photo.jpg',
          'caption': 'Morning light',
        },
      ],
    });
    expect(detail.album.title, 'Jugol streets');
    expect(detail.items, hasLength(1));
    expect(detail.items.first.caption, 'Morning light');
  });

  test('normalizeAppPath trims and ensures leading slash', () {
    expect(normalizeAppPath(' gallery '), '/gallery');
    expect(normalizeAppPath('search'), '/search');
  });
}
