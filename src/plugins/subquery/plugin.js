/*!
 * jQuery QueryBuilder Subquery
 * Enables the creation of subqueries
 */

Selectors.subquery_container = '.rules-subquery-container';

QueryBuilder.define('subquery', function(options) {
    this.status.subquery_id = 0;

    // Set the appropriate filter config options for subqueries
    this.on('afterInit', function(e, node) {
        var self = e.builder;
        self.filters.forEach(function(filter, i) {
            if ('subquery' in filter) {
                self.filters[i].input = self.createSubquery;
            }
        }, self);
    });

    // Initialize the subquery
    this.on('afterCreateRuleInput', function(e, rule) {
        var self = e.builder;
        self.initSubquery(rule);
    });

}, {
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
     * @return {string}
     */
    initSubquery: function(rule) {
        if (!('subquery_id' in rule)) {
            Utils.error('subquery', 'Subquery id missing in "{0}"', rule.id);
        }
        rule.$el.addClass('has-subquery');
        var opts = {};
        if ('subquery_opts' in rule) {
            opts = rule.subquery_opts;
        } else {
            opts = $.extendext(true, 'replace', this.settings, rule.filter.subquery);
        }
        $('#' + rule.subquery_id).queryBuilder(opts);
    }

});

