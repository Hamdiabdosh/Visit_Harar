import 'package:flutter/material.dart';

import '../../routing/app_router.dart';

import '../../api/models.dart';

String searchTypeLabel(String type) {
  switch (type) {
    case 'attraction':
      return 'Attraction';
    case 'guide':
      return 'Guide';
    case 'announcement':
      return 'News';
    case 'partner':
      return 'Partner';
    case 'itinerary':
      return 'Itinerary';
    default:
      return type;
  }
}

IconData searchTypeIcon(String type) {
  switch (type) {
    case 'attraction':
      return Icons.account_balance_outlined;
    case 'guide':
      return Icons.person_outline;
    case 'partner':
      return Icons.store_outlined;
    case 'itinerary':
      return Icons.route_outlined;
    case 'announcement':
      return Icons.campaign_outlined;
    default:
      return Icons.article_outlined;
  }
}

void openSearchResult(BuildContext context, SearchResultItem item) {
  switch (item.type) {
    case 'attraction':
      pushAppRoute(context, '/attractions/${item.slug}');
    case 'guide':
      pushAppRoute(context, '/guides/${item.slug}');
    case 'announcement':
      pushAppRoute(context, '/news/${item.slug}');
    case 'itinerary':
      pushAppRoute(context, '/itineraries/${item.slug}');
    case 'partner':
      pushAppRoute(context, '/services');
    default:
      if (item.href.trim().startsWith('/')) {
        pushAppRoute(context, item.href);
      }
  }
}
