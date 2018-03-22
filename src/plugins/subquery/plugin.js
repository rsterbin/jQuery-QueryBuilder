/*!
 * jQuery QueryBuilder Subquery
 * Enables the creation of subqueries
 */

Selectors.subquery_container = '.rules-subquery-container';
QueryBuilder.types['subquery'] = 'subquery';

QueryBuilder.define('subquery', function(options) {
    this.status.subquery_id = 0;

    // Set the appropriate filter config options for subqueries
    this.on('afterInit', function(e, node) {
        var self = e.builder;
        var ok_operators = [ 'equal', 'not_equal', 'in', 'not_in', 'is_empty', 'is_not_empty', 'is_null', 'is_not_null' ];
        self.filters.forEach(function(filter, i) {
            if ('subquery' in filter) {
                self.filters[i].type = 'subquery';
                self.filters[i].input = self.createSubquery;
                self.filters[i].validation = { callback: self.validateSubquery };
                self.filters[i].valueGetter = self.getSubqueryValue;
                self.filters[i].valueSetter = self.setSubqueryValue;
            }
        }, self);
        for (var i = 0; i < self.operators.length; ++i) {
            if (ok_operators.indexOf(self.operators[i].type) == -1) {
                continue;
            }
            self.operators[i].apply_to.push('subquery');
        }
    });

    // Initialize the subquery
    this.on('afterCreateRuleInput', function(e, rule) {
        var self = e.builder;
        if (rule.filter.type == 'subquery') {
            self.initSubquery(rule);
        }
    });

    // Drop the custom input function from json
    this.on('ruleToJson.filter', function(e, rule) {
        if (rule.filter.type == 'subquery') {
            delete e.value.input;
        }
    });

    // Build SQL text
    this.on('ruleToSQL.filter', function(e, rule, value, sqlFn) {
        var self = e.builder;
        if (rule.type == 'subquery') {
            e.value = self.getSubquerySql(e.value, rule);
        }
    });

    // Build SQL values
    this.on('ruleToSQLValues.filter', function(e, rule) {
        var self = e.builder;
        if (rule.type == 'subquery') {
            e.value = self.getSubquerySqlValues(rule);
        }
    });

});

QueryBuilder.extend({

    /**
     * Returns an incremented subquery ID
     * @return {string}
     */
    nextSubqueryId: function() {
        return this.status.id + '_subquery_' + (this.status.subquery_id++);
    },

    /**
     * Creates a new subquery as a "rule input"
     * @param rule {Rule}
     * @param name {string}
     * @return {string}
     */
    createSubquery: function(rule, name) {
        if (!('subquery' in rule.filter)) {
            Utils.error('subquery', 'Subquery config missing from "{0}"', rule.filter.id);
        }
        rule.subquery_id = this.nextSubqueryId();
        return '<div id="' + rule.subquery_id + '" class="rules-subquery-container"></div>';
    },

    /**
     * Initializes the subquery
     * @param rule {Rule}
     */
    initSubquery: function(rule) {
        if (!('subquery_id' in rule)) {
            Utils.error('subquery', 'Subquery id missing in "{0}" on initSubquery', rule.id);
        }
        rule.$el.addClass('has-subquery');
        var opts = $.extendext(true, 'replace', {}, rule.filter.subquery);
        var $b = $('#' + rule.subquery_id);
        $b.attr('data-subquery', rule.subquery_id);
        $b.queryBuilder(opts);
        
        $b.on('afterUpdateGroupCondition.queryBuilder', function(g,c) {		
			c.$el.trigger('change')
			});
		
    },

    /**
     * Validates the subquery
     * @param rule {Rule}
     * @return {boolean}
     */
    validateSubquery: function(value, rule) {
        if (!('subquery_id' in rule)) {
            Utils.error('subquery', 'Subquery id missing in "{0}" on validateSubquery', rule.id);
        }
        var $b = $('#' + rule.subquery_id);
        if ($b.queryBuilder('validate')) {
            return true;
        }
        else {
            return [ 'subquery_invalid' ];
        }
    },

    /**
     * Gets the subquery value
     * @param rule {Rule}
     * @param options {object}
     * @return {object}
     */
    getSubqueryValue: function(rule, opts) {
        if (!('subquery_id' in rule)) {
            Utils.error('subquery', 'Subquery id missing in "{0}" on getSubqueryValue', rule.id);
        }
        var $b = $('#' + rule.subquery_id);
        opts = $.extend({ validate: false }, opts);
        var value = $b.queryBuilder('getRules', opts);
        value.subquery_id = rule.subquery_id;
        return value;
    },

    /**
     * Sets the subquery value
     * @param rule {Rule}
     * @param value {object}
     * @return {object}
     */
    setSubqueryValue: function(rule, value) {
        if (!('subquery_id' in rule)) {
            Utils.error('subquery', 'Subquery id missing in "{0}" on setSubqueryValue', rule.id);
        }
        var $b = $('#' + rule.subquery_id);
        return $b.queryBuilder('setRules', value);
    },

    /**
     * Gets the subquery SQL
     * @param expression {string}
     * @param rule {Rule}
     * @param value {array}
     * @return {object}
     */
    getSubquerySql: function (expression, rule, value) {
        if (!('subquery_id' in rule.value)) {
            Utils.error('subquery', 'Subquery id missing in "{0}" on getSubquerySql', rule.id);
        }
        var $b = $('#' + rule.value.subquery_id);
        var sql = $b.queryBuilder('getSQL', 'question_mark').sql;
        var basic = { condition: 'AND', rules: [ $.extend({}, rule) ] };
        basic.rules[0].type = 'number';
        basic.rules[0].value = 1;
        var wrapper = this.getSQL('question_mark', false, basic);
        return wrapper.sql.replace(/\?/, ' SELECT id FROM ' + rule.id + ' WHERE ' + sql + ' ');
    },

    /**
     * Gets the subquery value as an array suitable for inclusion with the SQL
     * @param rule {Rule}
     * @return {object}
     */
    getSubquerySqlValues: function (rule) {
        if (!('subquery_id' in rule.value)) {
            Utils.error('subquery', 'Subquery id missing in "{0}" on getSubquerySqlValues', rule.id);
        }
        var $b = $('#' + rule.value.subquery_id);
        return $b.queryBuilder('getSQL', 'question_mark').params;
    }


});

