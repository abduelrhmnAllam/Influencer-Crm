<?php

namespace Tests;

use App\Support\Tenancy;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    protected function setUp(): void
    {
        parent::setUp();
        Tenancy::reset(); // يمنع تسرّب حالة المستأجر الثابتة بين الاختبارات
    }

    protected function tearDown(): void
    {
        Tenancy::reset();
        parent::tearDown();
    }
}
