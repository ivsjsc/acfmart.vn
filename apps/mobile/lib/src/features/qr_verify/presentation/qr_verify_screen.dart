import 'package:flutter/material.dart';

import '../../../shared/widgets/page_placeholder.dart';

class QrVerifyScreen extends StatelessWidget {
  const QrVerifyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('QR xác thực')),
      body: const PagePlaceholder(
        title: 'QR verify',
        description:
            'Camera scanning, authenticity checks, and verification history will live here.',
      ),
    );
  }
}
