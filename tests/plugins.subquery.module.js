$(function () {
    var $b = $('#builder');

    QUnit.module('plugins.subquery', {
        afterEach: function () {
            $b.queryBuilder('destroy');
        }
    });

    QUnit.test('Get/set subquery rules', function (assert) {
        $b.queryBuilder({
            filters: subquery_filters,
            rules: subquery_rules,
            plugins: ['subquery']
        });

        var result = $b.queryBuilder('getRules');
        assert.rulesMatch(
            result.rules[0].value,
            subquery_rules.rules[0].value,
            'Should return the rules it set for the subquery builder'
        );

        // For some reason, leaving these in causes max-diff errors
        delete result.rules[0].value;
        delete subquery_rules.rules[0].value;
        assert.rulesMatch(
            result,
            subquery_rules,
            'Should return the rules it set for the main builder'
        );
    });

    QUnit.test('Validate subquery rules', function (assert) {
        $b.queryBuilder({
            filters: subquery_filters,
            plugins: ['subquery']
        });

        $('[name=builder_rule_0_filter]').val('subscriptions').trigger('change');
        $('[name=builder_subquery_0_rule_0_filter]').val('name').trigger('change');
        $b.queryBuilder('validate');

        assert.equal(
            $b.find('.error-container').eq(1).attr('title'),
            'Error in subquery',
            'Should indicate an error in the subquery'
        );

        assert.equal(
            $b.find('.error-container').eq(3).attr('title'),
            'Empty value',
            'Should note missing value in first subquery rule'
        );
    });

    QUnit.test('Check subquery operators', function (assert) {
        $b.queryBuilder({
            filters: subquery_filters,
            plugins: ['subquery']
        });

        $('[name=builder_rule_0_filter]').val('subscriptions').trigger('change');

        assert.optionsMatch(
            $('#builder_rule_0 [name$=_operator]').first().find('option'),
            [ 'equal', 'not_equal', 'in', 'not_in', 'is_empty', 'is_not_empty', 'is_null', 'is_not_null' ],
            '"subscriptions" subquery filter should by default have only the subquery operators'
        );

    });

    var subquery_filters = [{
        id: "subscriptions",
        label: "Subscriptions",
        subquery: {
            default_filter: 'name',
            display_empty_filter: false,
            filters: [{
                id: "name",
                type: "string",
                label: "Name"
            }, {
                id: "status",
                type: "string",
                label: "Status",
                input: "select",
                multiple: true,
                values: {
                    ac: "Active",
                    in: "Inactive",
                    tr: "Terminated"
                }
            }]
        }
    }];

    var subquery_rules = {
        condition: 'AND',
        rules: [{
            id: 'subscriptions',
            field: 'subscriptions',
            type: 'subquery',
            operator: 'in',
            value: {
                condition: 'AND',
                rules: [{
                    id: 'name',
                    operator: 'contains',
                    value: 'Hello'
                }, {
                    id: 'status',
                    operator: 'equal',
                    value: 'ac'
                }]
            }
        }]
    };

});
